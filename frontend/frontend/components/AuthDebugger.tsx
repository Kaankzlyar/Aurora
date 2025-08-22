import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfoFromToken } from '../api/auth';

export default function AuthDebugger() {
  const [authInfo, setAuthInfo] = useState({
    hasToken: false,
    tokenPreview: '',
    userInfo: null,
    tokenValid: false,
    tokenExpired: false,
  });

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      let tokenData = null;
      let isValid = false;
      let isExpired = false;
      
      if (token) {
        try {
          tokenData = await getUserInfoFromToken(token);
          
          if (tokenData && tokenData.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            isExpired = tokenData.exp < currentTime;
            isValid = !isExpired && tokenData.id;
          }
        } catch (error) {
          console.error('🔍 [AuthDebugger] Error getting token data:', error);
        }
      }
      
      setAuthInfo({
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 50) + '...' : 'No token',
        userInfo: userInfo ? JSON.parse(userInfo) : null,
        tokenValid: isValid,
        tokenExpired: isExpired,
      });
      
      console.log('🔍 [AuthDebugger] Current auth status:', {
        hasToken: !!token,
        tokenValid: isValid,
        tokenExpired: isExpired,
        userInfo: userInfo ? JSON.parse(userInfo) : null,
      });
    } catch (error) {
      console.error('🔍 [AuthDebugger] Error checking auth:', error);
    }
  };

  const testFavoritesAPI = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Debug', 'No token found - user needs to login');
        return;
      }
      
      console.log('🧪 [AuthDebugger] Testing favorites API with token:', token.substring(0, 50) + '...');
      
      const response = await fetch('http://192.168.1.142:5270/api/user/favorites', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🧪 [AuthDebugger] Response status:', response.status);
      console.log('🧪 [AuthDebugger] Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        Alert.alert('Debug', `API Success! Found ${data.length} favorites`);
      } else {
        const errorText = await response.text();
        console.log('🧪 [AuthDebugger] Error response:', errorText);
        Alert.alert('Debug', `API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('🧪 [AuthDebugger] API test error:', error);
      Alert.alert('Debug', `Network Error: ${error.message}`);
    }
  };

  const clearAuth = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      await AsyncStorage.removeItem('userEmail');
      checkAuthStatus();
      Alert.alert('Debug', 'Auth data cleared');
    } catch (error) {
      console.error('🧪 [AuthDebugger] Clear auth error:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Auth Debugger</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.label}>Token Status:</Text>
        <Text style={authInfo.hasToken ? styles.success : styles.error}>
          {authInfo.hasToken ? '✅ Found' : '❌ Missing'}
        </Text>
      </View>
      
      <View style={styles.infoBox}>
        <Text style={styles.label}>Token Valid:</Text>
        <Text style={authInfo.tokenValid ? styles.success : styles.error}>
          {authInfo.tokenValid ? '✅ Valid' : '❌ Invalid/Expired'}
        </Text>
      </View>
      
      {authInfo.tokenExpired && (
        <Text style={styles.warning}>⚠️ Token is expired - user needs to login again</Text>
      )}
      
      <View style={styles.infoBox}>
        <Text style={styles.label}>User Info:</Text>
        <Text style={styles.value}>
          {authInfo.userInfo ? authInfo.userInfo.name || authInfo.userInfo.email : 'None'}
        </Text>
      </View>
      
      <View style={styles.buttonRow}>
        <Pressable style={styles.button} onPress={checkAuthStatus}>
          <Text style={styles.buttonText}>Refresh</Text>
        </Pressable>
        
        <Pressable style={styles.button} onPress={testFavoritesAPI}>
          <Text style={styles.buttonText}>Test API</Text>
        </Pressable>
        
        <Pressable style={[styles.button, styles.dangerButton]} onPress={clearAuth}>
          <Text style={styles.buttonText}>Clear Auth</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 6,
  },
  label: {
    color: '#CCC',
    fontSize: 14,
  },
  value: {
    color: '#FFF',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  success: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  error: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: 'bold',
  },
  warning: {
    color: '#FF9800',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 8,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  button: {
    backgroundColor: '#C48913',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
