import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, getUserInfoFromToken } from '../../api/auth';
import { AuthPage } from '../../components/AuthPage';
import { PremiumTransition } from '../../components/PremiumTransition';

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    try {
      console.log('[LoginScreen] Attempting login with:', formData.email);
      
      const result = await loginUser(formData.email, formData.password);
      
      if (result?.token) {
        await AsyncStorage.setItem('userToken', result.token);
        
        // Try to extract user info from JWT token first
        const tokenUserInfo = await getUserInfoFromToken(result.token);
        
        let userInfo;
        if (tokenUserInfo && (tokenUserInfo.email || tokenUserInfo.name)) {
          // Use info from JWT token
          const displayName = tokenUserInfo.fullName || 
                             tokenUserInfo.name || 
                             `${tokenUserInfo.firstName || ''} ${tokenUserInfo.lastName || ''}`.trim() ||
                             tokenUserInfo.username ||
                             formData.email.split('@')[0] || // Use email username part as fallback
                             'Kullanıcı';
          
          userInfo = {
            name: displayName,
            email: tokenUserInfo.email || formData.email,
            firstName: tokenUserInfo.firstName,
            lastName: tokenUserInfo.lastName,
            id: tokenUserInfo.id,
            username: tokenUserInfo.username
          };
        } else if (result.user || result.email) {
          // Fallback to response data
          userInfo = {
            name: result.user?.name || result.name || formData.email.split('@')[0] || 'Kullanıcı',
            email: result.user?.email || result.email || formData.email,
            firstName: result.user?.firstName || result.firstName,
            lastName: result.user?.lastName || result.lastName
          };
        } else {
          // Last fallback - use email username part
          userInfo = {
            name: formData.email.split('@')[0] || 'Kullanıcı',
            email: formData.email
          };
        }
        
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        await AsyncStorage.setItem('userEmail', userInfo.email);
        console.log('[LoginScreen] Saved user info:', userInfo);
        
        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        alert(result?.message || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('[LoginScreen] Login error:', error);
      alert('Giriş sırasında hata oluştu');
    }
  };

  const navigateToRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <View style={styles.container}>
      <PremiumTransition isVisible={isVisible} duration={900} disableGlow={true}>
        <AuthPage
          isLogin={true}
          formData={formData}
          onChange={(key, value) => setFormData(prev => ({ ...prev, [key]: value }))}
          onSubmit={handleLogin}
          onToggle={navigateToRegister}
        />
      </PremiumTransition>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
