
import { useEffect } from 'react';
import { Redirect } from "expo-router";
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('[RootIndex] Auth state:', { isAuthenticated, isLoading });
  
  if (isLoading) {
    console.log('[RootIndex] Still loading, showing null');
    return null; // Show loading state handled by AuthProvider
  }
  
  if (isAuthenticated) {
    console.log('[RootIndex] ✅ User authenticated, redirecting to tabs');
    return <Redirect href="/(tabs)" />;
  } else {
    console.log('[RootIndex] ❌ User not authenticated, redirecting to login');
    return <Redirect href="/(auth)/login" />;
  }
}

