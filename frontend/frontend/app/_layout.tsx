import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAuthScreen, setCurrentAuthScreen] = useState('login');

  // Load custom fonts
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold, 
    PlayfairDisplay_900Black,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    CormorantGaramond_500Medium_Italic
  });

  useEffect(() => {
    // Always check auth status after 2 seconds, regardless of font loading
    const timer = setTimeout(() => {
      if (!fontsLoaded && !fontError) {
        console.log('[App] Font loading taking too long, proceeding without custom fonts');
      }
      checkAuthStatus();
    }, 2000);

    if (fontsLoaded || fontError) {
      console.log('[App] Fonts loaded:', fontsLoaded, 'Font error:', fontError);
      clearTimeout(timer);
      checkAuthStatus();
    }

    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('[App] Checking auth status - token found:', token ? 'YES' : 'NO');
      console.log('[App] Token value:', token);
      
      if (token) {
        console.log('[App] Token found, setting authenticated to true');
        setIsAuthenticated(true);
      } else {
        console.log('[App] No token found, staying on login screen');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[App] Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      console.log('[App] Logging out - removing token');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      setIsAuthenticated(false);
      console.log('[App] Logout complete');
    } catch (error) {
      console.error('[App] Error during logout:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {(!fontsLoaded && !fontError) ? 'Loading fonts...' : 'Loading...'}
        </Text>
        {fontError && (
          <Text style={[styles.loadingText, { color: '#ff6b6b', fontSize: 12, marginTop: 8 }]}>
            Font loading failed, using system fonts
          </Text>
        )}
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        {currentAuthScreen === 'login' ? (
          <LoginForm 
            onSuccess={handleLoginSuccess} 
            onToggle={() => setCurrentAuthScreen('register')} 
          />
        ) : (
          <RegisterForm 
            onSuccess={() => setCurrentAuthScreen('login')} 
            onToggle={() => setCurrentAuthScreen('login')} 
          />
        )}
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});
