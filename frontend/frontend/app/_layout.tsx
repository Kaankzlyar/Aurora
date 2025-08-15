import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function AppNavigator() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [currentAuthScreen, setCurrentAuthScreen] = React.useState('login');

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

  const handleLoginSuccess = () => {
    login();
  };

  if (isLoading || (!fontsLoaded && !fontError)) {
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
      <>
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
      </>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
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
