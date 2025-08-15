import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfoFromToken } from '../api/auth';

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
  login: (email?: string) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  updateUserInfo: (info: UserInfo) => void;
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
      const token = await AsyncStorage.getItem('userToken');
      const savedUserInfo = await AsyncStorage.getItem('userInfo');
      const savedEmail = await AsyncStorage.getItem('userEmail');
      
      console.log('[AuthContext] Checking auth status - token found:', token ? 'YES' : 'NO');
      console.log('[AuthContext] Saved email found:', savedEmail);
      
      if (token) {
        console.log('[AuthContext] Token found, setting authenticated to true');
        setIsAuthenticated(true);
        
        // Try to get user info from saved info first (has email), then from token
        let userData = null;
        if (savedUserInfo) {
          try {
            userData = JSON.parse(savedUserInfo);
            console.log('[AuthContext] Using saved user info (has email):', userData);
          } catch (e) {
            console.log('[AuthContext] Failed to parse saved user info');
          }
        }
        
        // If no saved info, fallback to token data
        if (!userData && token) {
          userData = getUserInfoFromToken(token);
          console.log('[AuthContext] Using token user info (fallback):', userData);
        }
        
        // Always ensure we have the saved email
        if (userData && savedEmail && !userData.email) {
          userData.email = savedEmail;
          console.log('[AuthContext] Added saved email to user data:', userData);
        }
        
        if (userData) {
          setUserInfo(userData);
          console.log('[AuthContext] User info loaded:', userData);
        }
      } else {
        console.log('[AuthContext] No token found, setting authenticated to false');
        setIsAuthenticated(false);
        setUserInfo(null);
      }
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

  const login = (email?: string) => {
    console.log('[AuthContext] User logged in with email:', email);
    setIsAuthenticated(true);
    
    // If email is provided, save it to AsyncStorage for future use
    if (email) {
      AsyncStorage.setItem('userEmail', email);
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Logging out - removing tokens');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      await AsyncStorage.removeItem('userEmail');
      setIsAuthenticated(false);
      setUserInfo(null);
      console.log('[AuthContext] Logout complete');
    } catch (error) {
      console.error('[AuthContext] Error during logout:', error);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
