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
      console.log('🔍 [TokenValidator] No token found in storage');
      return {
        isValid: false,
        isExpired: false,
        hasToken: false,
        shouldRedirectToLogin: true,
      };
    }

    console.log('🔍 [TokenValidator] Token found, length:', token.length);

    // First, try to decode the token manually to check basic JWT structure
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('🔍 [TokenValidator] Invalid JWT format (not 3 parts)');
      return {
        isValid: false,
        isExpired: false,
        hasToken: true,
        shouldRedirectToLogin: true,
      };
    }

    // Try to decode the payload manually first
    let payload: any = null;
    let manualDecodeSuccess = false;
    
    try {
      const base64Payload = tokenParts[1];
      const paddedPayload = base64Payload + '='.repeat((4 - base64Payload.length % 4) % 4);
      const decodedPayload = atob(paddedPayload);
      payload = JSON.parse(decodedPayload);
      manualDecodeSuccess = true;
      console.log('🔍 [TokenValidator] Manual JWT decode successful');
    } catch (manualError) {
      console.log('🔍 [TokenValidator] Manual JWT decode failed, trying getUserInfoFromToken:', manualError);
    }

    // If manual decode failed, try the getUserInfoFromToken function
    if (!manualDecodeSuccess) {
      try {
        const tokenData = await getUserInfoFromToken(token);
        if (tokenData) {
          payload = tokenData;
          console.log('🔍 [TokenValidator] getUserInfoFromToken successful');
        }
      } catch (apiError) {
        console.log('🔍 [TokenValidator] getUserInfoFromToken also failed:', apiError);
      }
    }

    // If we still don't have payload, the token is invalid
    if (!payload) {
      console.log('🔍 [TokenValidator] Could not decode token payload');
      return {
        isValid: false,
        isExpired: false,
        hasToken: true,
        shouldRedirectToLogin: true,
      };
    }

    // Check if token has expiration
    if (!payload.exp) {
      console.log('🔍 [TokenValidator] Token has no expiration time');
      // If no expiration, assume it's valid (some tokens don't expire)
      return {
        isValid: true,
        isExpired: false,
        hasToken: true,
        shouldRedirectToLogin: false,
      };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < currentTime;
    const timeUntilExpiry = payload.exp - currentTime;
    
    console.log('🔍 [TokenValidator] Token validation result:', {
      hasToken: true,
      expirationTime: new Date(payload.exp * 1000).toISOString(),
      currentTime: new Date(currentTime * 1000).toISOString(),
      isExpired,
      timeUntilExpiry: timeUntilExpiry > 0 ? `${Math.floor(timeUntilExpiry / 60)} minutes` : 'expired',
    });

    // Only redirect to login if token is actually expired
    // Don't redirect for minor validation issues
    const shouldRedirect = isExpired;

    return {
      isValid: !isExpired,
      isExpired,
      hasToken: true,
      shouldRedirectToLogin: shouldRedirect,
      expirationTime: payload.exp,
      timeUntilExpiry: timeUntilExpiry > 0 ? timeUntilExpiry : 0,
    };
  } catch (error) {
    console.error('🔍 [TokenValidator] Error validating token:', error);
    // Don't immediately redirect to login on validation errors
    // Instead, assume the token might be valid and let the app continue
    return {
      isValid: true, // Assume valid to prevent unnecessary redirects
      isExpired: false,
      hasToken: true,
      shouldRedirectToLogin: false,
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
