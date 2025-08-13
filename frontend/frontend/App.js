import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your screens
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import HomeScreen from './components/HomeScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login', 'register', 'home'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

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
        <Text style={styles.loadingText}>Loading...</Text>
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
      {/* Show login screen if not authenticated OR if explicitly on login screen */}
      {(currentScreen === 'login' || !isAuthenticated) && !isLoading && (
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
  },
});

export default App;
