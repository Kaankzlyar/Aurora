import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfoFromToken } from '../api/auth';

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  hasToken: boolean;
  shouldRedirectToLogin: boolean;
  expirationTime?: number;
  timeUntilExpiry?: number;
}

/**
 * Validate the current stored token
 */
export const validateStoredToken = async (): Promise<TokenValidationResult> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      return {
        isValid: false,
        isExpired: false,
        hasToken: false,
        shouldRedirectToLogin: true,
      };
    }

    const tokenData = await getUserInfoFromToken(token);
    
    if (!tokenData || !tokenData.exp) {
      // Invalid token format
      return {
        isValid: false,
        isExpired: false,
        hasToken: true,
        shouldRedirectToLogin: true,
      };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = tokenData.exp < currentTime;
    const timeUntilExpiry = tokenData.exp - currentTime;
    
    console.log('🔍 [TokenValidator] Token validation:', {
      hasToken: true,
      expirationTime: new Date(tokenData.exp * 1000).toISOString(),
      currentTime: new Date(currentTime * 1000).toISOString(),
      isExpired,
      timeUntilExpiry: timeUntilExpiry > 0 ? `${Math.floor(timeUntilExpiry / 60)} minutes` : 'expired',
    });

    return {
      isValid: !isExpired && !!tokenData.id,
      isExpired,
      hasToken: true,
      shouldRedirectToLogin: isExpired,
      expirationTime: tokenData.exp,
      timeUntilExpiry: timeUntilExpiry > 0 ? timeUntilExpiry : 0,
    };
  } catch (error) {
    console.error('🔍 [TokenValidator] Error validating token:', error);
    return {
      isValid: false,
      isExpired: false,
      hasToken: false,
      shouldRedirectToLogin: true,
    };
  }
};

/**
 * Clear expired or invalid tokens from storage
 */
export const clearInvalidToken = async (): Promise<void> => {
  try {
    console.log('🧹 [TokenValidator] Clearing invalid/expired tokens');
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
    await AsyncStorage.removeItem('userEmail');
  } catch (error) {
    console.error('🧹 [TokenValidator] Error clearing tokens:', error);
  }
};

/**
 * Check if token will expire soon (within the next 5 minutes)
 */
export const isTokenExpiringSoon = async (): Promise<boolean> => {
  const validation = await validateStoredToken();
  if (!validation.hasToken || !validation.timeUntilExpiry) {
    return false;
  }
  
  // Return true if token expires within 5 minutes (300 seconds)
  return validation.timeUntilExpiry <= 300;
};
