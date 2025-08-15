import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
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

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('[AuthContext] Checking auth status - token found:', token ? 'YES' : 'NO');
      
      if (token) {
        console.log('[AuthContext] Token found, setting authenticated to true');
        setIsAuthenticated(true);
      } else {
        console.log('[AuthContext] No token found, setting authenticated to false');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[AuthContext] Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    console.log('[AuthContext] User logged in');
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Logging out - removing tokens');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      setIsAuthenticated(false);
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
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
