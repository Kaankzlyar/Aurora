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
      if (token) {
        setIsAuthenticated(true);
        setCurrentScreen('home');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentScreen('home');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  const navigateToRegister = () => setCurrentScreen('register');
  const navigateToLogin = () => setCurrentScreen('login');

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
      {currentScreen === 'home' && isAuthenticated && (
        <HomeScreen onLogout={handleLogout} />
      )}
      {currentScreen === 'register' && (
        <RegisterForm 
          onSuccess={navigateToLogin} 
          onToggle={navigateToLogin} 
        />
      )}
      {currentScreen === 'login' && (
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
