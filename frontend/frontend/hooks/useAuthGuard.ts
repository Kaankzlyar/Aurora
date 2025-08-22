import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { validateStoredToken, clearInvalidToken } from '../utils/tokenValidator';
import { router } from 'expo-router';

/**
 * Hook to automatically check for expired tokens and redirect to login
 * Use this in components that require authentication
 */
export const useAuthGuard = () => {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // Simplified check to avoid hook order issues
    const checkTokenValidity = async () => {
      try {
        if (isAuthenticated) {
          const validation = await validateStoredToken();
          
          if (validation.shouldRedirectToLogin) {
            console.log('🚨 [useAuthGuard] Token expired/invalid - forcing logout and redirect');
            
            // Clear invalid tokens
            await clearInvalidToken();
            
            // Logout user
            logout();
            
            // Redirect to login
            router.replace('/(auth)/login');
          }
        }
      } catch (error) {
        console.error('🚨 [useAuthGuard] Error checking token validity:', error);
      }
    };

    // Only check once on mount to avoid conflicts
    checkTokenValidity();
  }, []); // Remove dependencies to avoid re-renders

  return { isAuthenticated };
};
