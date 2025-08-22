import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfoFromToken } from '../api/auth';
import { validateStoredToken, clearInvalidToken } from '../utils/tokenValidator';
import { router } from 'expo-router';

interface UserInfo {
  id?: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: UserInfo | null;
  login: (email?: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  updateUserInfo: (info: UserInfo) => void;
  refreshUserInfoFromToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const checkAuthStatus = async () => {
    try {
      console.log('[AuthContext] ===== AUTH STATUS CHECK WITH VALIDATION =====');
      
      // Validate token first
      const validation = await validateStoredToken();
      
      console.log('[AuthContext] Token validation result:', {
        hasToken: validation.hasToken,
        isValid: validation.isValid,
        isExpired: validation.isExpired,
        shouldRedirectToLogin: validation.shouldRedirectToLogin,
      });
      
      if (validation.shouldRedirectToLogin) {
        console.log('[AuthContext] ⚠️ Token invalid/expired - redirecting to login');
        
        // Clear invalid tokens
        await clearInvalidToken();
        
        // Set authentication to false
        setIsAuthenticated(false);
        setUserInfo(null);
        
        // Redirect to login - using router.replace to clear navigation stack
        try {
          router.replace('/(auth)/login');
        } catch (routerError) {
          console.log('[AuthContext] Router not available, state set to unauthenticated');
        }
        
        return;
      }
      
      if (validation.isValid && validation.hasToken) {
        // Token is valid, proceed with normal flow
        const token = await AsyncStorage.getItem('userToken');
        const savedUserInfo = await AsyncStorage.getItem('userInfo');
        const savedEmail = await AsyncStorage.getItem('userEmail');
        
        console.log('[AuthContext] ✅ Valid token found, setting authenticated to true');
        setIsAuthenticated(true);
        
        // Try to get user info from saved info first (has email), then from token
        let userData = null;
        if (savedUserInfo) {
          try {
            userData = JSON.parse(savedUserInfo);
            console.log('[AuthContext] ✅ Parsed saved user info successfully:', userData);
          } catch (e) {
            console.log('[AuthContext] ❌ Failed to parse saved user info:', e);
          }
        }
        
        // If no saved info, fallback to token data
        if (!userData && token) {
          try {
            userData = await getUserInfoFromToken(token);
            console.log('[AuthContext] Using token user info (fallback):', userData);
          } catch (error) {
            console.log('[AuthContext] Error getting user info from token:', error);
          }
        }
        
        // Always ensure we have the saved email
        if (userData && savedEmail && !userData.email) {
          userData.email = savedEmail;
          console.log('[AuthContext] Added saved email to user data:', userData);
        }
        
        if (userData) {
          setUserInfo(userData);
          console.log('[AuthContext] ✅ Final user info set in context:', userData);
        } else {
          console.log('[AuthContext] ❌ No user data available');
        }
      } else {
        console.log('[AuthContext] No valid token found, setting authenticated to false');
        setIsAuthenticated(false);
        setUserInfo(null);
      }
      
      console.log('[AuthContext] ==============================');
    } catch (error) {
      console.error('[AuthContext] Error checking auth status:', error);
      setIsAuthenticated(false);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserInfo = useCallback((info: UserInfo) => {
    setUserInfo(info);
    AsyncStorage.setItem('userInfo', JSON.stringify(info));
  }, []);

  const refreshUserInfoFromToken = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const userData = await getUserInfoFromToken(token);
        if (userData) {
          setUserInfo(userData);
          await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
          console.log('[AuthContext] ✅ User info refreshed from token:', userData);
        }
      }
    } catch (error) {
      console.error('[AuthContext] Error refreshing user info from token:', error);
    }
  }, []);

  const login = async (email?: string) => {
    console.log('[AuthContext] User logged in with email:', email);
    
    // If email is provided, save it to AsyncStorage for future use
    if (email) {
      await AsyncStorage.setItem('userEmail', email);
    }
    
    // Immediately refresh user info from the new token
    await refreshUserInfoFromToken();
    
    // Set authentication to true AFTER we've confirmed we have user info
    setIsAuthenticated(true);
    console.log('[AuthContext] ✅ Authentication state set to true');
    
    // Don't call checkAuthStatus here as it might override our state
    // The component will naturally re-render with the new state
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Logging out - removing tokens');
      setIsLoading(true); // Prevent race conditions during logout
      
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      await AsyncStorage.removeItem('userEmail');
      
      setIsAuthenticated(false);
      setUserInfo(null);
      setIsLoading(false);
      
      console.log('[AuthContext] Logout complete');
      
      // Navigate to login screen after a small delay to ensure state is updated
      setTimeout(() => {
        try {
          router.replace('/(auth)/login');
          console.log('[AuthContext] Redirected to login screen');
        } catch (routerError) {
          console.log('[AuthContext] Router navigation failed, but state updated:', routerError);
        }
      }, 100);
      
    } catch (error) {
      console.error('[AuthContext] Error during logout:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    userInfo,
    login,
    logout,
    checkAuthStatus,
    updateUserInfo,
    refreshUserInfoFromToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
