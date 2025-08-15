import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
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

// Import your screens
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import HomeScreen from './components/HomeScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login', 'register', 'home'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        // Validate token before setting authenticated
        // For now, we'll trust any existing token, but in production you should validate it
        console.log('[App] Token found, setting authenticated to true');
        setIsAuthenticated(true);
        setCurrentScreen('home');
      } else {
        console.log('[App] No token found, staying on login screen');
        setIsAuthenticated(false);
        setCurrentScreen('login');
      }
    } catch (error) {
      console.error('[App] Error checking auth status:', error);
      setIsAuthenticated(false);
      setCurrentScreen('login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentScreen('home');
  };

  const handleLogout = async () => {
    try {
      console.log('[App] Logging out - removing token');
      await AsyncStorage.removeItem('userToken');
      setIsAuthenticated(false);
      setCurrentScreen('login');
      console.log('[App] Logout complete');
    } catch (error) {
      console.error('[App] Error during logout:', error);
    }
  };

  // Debug function to clear storage (you can call this if needed)
  const clearStorage = async () => {
    try {
      console.log('[App] Clearing all AsyncStorage');
      await AsyncStorage.clear();
      setIsAuthenticated(false);
      setCurrentScreen('login');
    } catch (error) {
      console.error('[App] Error clearing storage:', error);
    }
  };

  const navigateToRegister = () => {
    if (!isAuthenticated) {
      setCurrentScreen('register');
    }
  };
  
  const navigateToLogin = () => {
    setCurrentScreen('login');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
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

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      {/* Only show home screen if both conditions are true */}
      {currentScreen === 'home' && isAuthenticated && (
        <HomeScreen onLogout={handleLogout} />
      )}
      {/* Show register screen only if not authenticated */}
      {currentScreen === 'register' && !isAuthenticated && (
        <RegisterForm 
          onSuccess={navigateToLogin} 
          onToggle={navigateToLogin} 
        />
      )}
      {/* Show login screen only if on login screen and not loading */}
      {currentScreen === 'login' && !isLoading && (
        <LoginForm 
          onSuccess={handleLoginSuccess} 
          onToggle={navigateToRegister} 
        />
      )}
    </View>
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

export default App;
