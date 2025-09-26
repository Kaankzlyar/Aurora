import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { testBackendConnection } from '../services/favorites';
import { validateStoredToken } from '../utils/tokenValidator';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthDebugger() {
  const [debugInfo, setDebugInfo] = useState<string>('');

  const testAuth = async () => {
    try {
      setDebugInfo('🔍 Test ediliyor...\n');
      
      // 1. Token'ı kontrol et
      const token = await AsyncStorage.getItem('userToken');
      setDebugInfo(prev => prev + `Token: ${token ? '✅ Bulundu' : '❌ Bulunamadı'}\n`);
      
      if (token) {
        setDebugInfo(prev => prev + `Token uzunluğu: ${token.length}\n`);
        setDebugInfo(prev => prev + `Token başlangıcı: ${token.substring(0, 50)}...\n`);
      }
      
      // 2. Token validation
      setDebugInfo(prev => prev + '\n🔐 Token Validation:\n');
      const validation = await validateStoredToken();
      setDebugInfo(prev => prev + `Valid: ${validation.isValid}\n`);
      setDebugInfo(prev => prev + `Expired: ${validation.isExpired}\n`);
      setDebugInfo(prev => prev + `Has Token: ${validation.hasToken}\n`);
      setDebugInfo(prev => prev + `Time Until Expiry: ${validation.timeUntilExpiry} seconds\n`);
      
      // 3. Backend connection test
      setDebugInfo(prev => prev + '\n🌐 Backend Test:\n');
      const backendTest = await testBackendConnection();
      setDebugInfo(prev => prev + `Success: ${backendTest.success}\n`);
      setDebugInfo(prev => prev + `Message: ${backendTest.message}\n`);
      
    } catch (error) {
      setDebugInfo(prev => prev + `\n❌ Hata: ${error.message}\n`);
    }
  };

  const clearToken = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setDebugInfo('🧹 Token temizlendi\n');
    } catch (error) {
      setDebugInfo(prev => prev + `❌ Token temizleme hatası: ${error.message}\n`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Auth Debugger</Text>
      
      <TouchableOpacity style={styles.button} onPress={testAuth}>
        <Text style={styles.buttonText}>🔍 Test Et</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.clearButton} onPress={clearToken}>
        <Text style={styles.buttonText}>🧹 Token Temizle</Text>
      </TouchableOpacity>
      
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Bilgileri:</Text>
        <Text style={styles.debugText}>{debugInfo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#C0C0C0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#000000',
    textAlign: 'center',
    fontWeight: '600',
  },
  debugContainer: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#C0C0C0',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
