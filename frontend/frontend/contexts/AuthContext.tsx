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
  getCurrentToken: () => Promise<string | null>;
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
      
      // Only redirect to login if token is actually expired or completely invalid
      if (validation.shouldRedirectToLogin && validation.isExpired) {
        console.log('[AuthContext] ⚠️ Token expired - redirecting to login');
        
        // Clear expired tokens
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
      
      // If we have a token (even if validation had minor issues), try to use it
      if (validation.hasToken) {
        console.log('[AuthContext] ✅ Token found, attempting to use it');
        
        const token = await AsyncStorage.getItem('userToken');
        const savedUserInfo = await AsyncStorage.getItem('userInfo');
        const savedEmail = await AsyncStorage.getItem('userEmail');
        
        // Set authenticated to true if we have a token
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
            // Don't fail completely - we still have a token
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
          console.log('[AuthContext] ❌ No user data available, but keeping authenticated state');
          // Even without user data, if we have a token, stay authenticated
        }
      } else {
        console.log('[AuthContext] No token found, setting authenticated to false');
        setIsAuthenticated(false);
        setUserInfo(null);
      }
      
      console.log('[AuthContext] ==============================');
    } catch (error) {
      console.error('[AuthContext] Error checking auth status:', error);
      // Don't immediately fail on errors - check if we have a token
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          console.log('[AuthContext] Error occurred but token exists, keeping authenticated state');
          setIsAuthenticated(true);
          // Don't clear user info on validation errors
        } else {
          console.log('[AuthContext] No token found, setting unauthenticated');
          setIsAuthenticated(false);
          setUserInfo(null);
        }
      } catch (tokenError) {
        console.error('[AuthContext] Error checking token storage:', tokenError);
        setIsAuthenticated(false);
        setUserInfo(null);
      }
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

  const getCurrentToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token;
    } catch (error) {
      console.error('[AuthContext] Error getting current token:', error);
      return null;
    }
  }, []);

  const login = async (email?: string) => {
    console.log('[AuthContext] User logged in with email:', email);
    
    // If email is provided, save it to AsyncStorage for future use
    if (email) {
      await AsyncStorage.setItem('userEmail', email);
    }
    
    // Small delay to ensure token is properly stored by login screen
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get the token that was just stored by the login screen
    const token = await AsyncStorage.getItem('userToken');
    console.log('[AuthContext] Token from storage after login:', token ? '✅ Found' : '❌ Not found');
    
    if (token) {
      // Set authentication to true immediately since we have a token
      setIsAuthenticated(true);
      console.log('[AuthContext] ✅ Authentication state set to true');
      
      // Refresh user info from the token
      try {
        const userData = await getUserInfoFromToken(token);
        if (userData) {
          setUserInfo(userData);
          await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
          console.log('[AuthContext] ✅ User info set from token:', userData);
        }
      } catch (error) {
        console.error('[AuthContext] Error getting user info from token:', error);
        // Even if we can't get user info, we still have a valid token
        // so authentication should remain true
      }
    } else {
      console.log('[AuthContext] ❌ No token found after login, this is unexpected');
      // If no token found, this is an error condition
      setIsAuthenticated(false);
      setUserInfo(null);
    }
    
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
    getCurrentToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
