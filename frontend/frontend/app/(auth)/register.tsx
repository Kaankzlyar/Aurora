import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from '../../api/auth';
import { AuthPage } from '../../components/AuthPage';
import { PremiumTransition } from '../../components/PremiumTransition';
import NotificationAlert from '../../components/NotificationAlert';
import { useNotification } from '../../hooks/useNotification';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [isVisible, setIsVisible] = useState(false);
  
  // Notification hook
  const { notification, showSuccess, showError, showInfo, hideNotification } = useNotification();

  useEffect(() => {
    // Trigger premium entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      showError('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    try {
      console.log('[RegisterScreen] Attempting registration for:', formData.email);
      
      const result = await registerUser(
        formData.firstName, 
        formData.lastName, 
        formData.email, 
        formData.password
      );

      console.log('[RegisterScreen] Registration result:', result);

      // Check for successful registration with new response format
      if (result.accessToken && result.user) {
        // Save token to AsyncStorage
        await AsyncStorage.setItem('userToken', result.accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        
        console.log('[RegisterScreen] ✅ Registration successful, token saved');
        showSuccess('Başarılı!', `Hoş geldin ${result.user.name}! Kayıt başarılı.`);
        
        // Navigate to main app
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 2000);
      } else if (result.message === 'User registered successfully.') {
        // Fallback for old response format
        showSuccess('Başarılı!', 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 2000);
      } else if (result.message && result.message.includes('zaten kayıtlı')) {
        // Handle duplicate email error
        showError('E-posta Zaten Kayıtlı', 'Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta adresi kullanın veya giriş yapmayı deneyin.');
      } else {
        showError('Kayıt Hatası', result.message || 'Kayıt sırasında hata oluştu');
      }
    } catch (error) {
      console.error('[RegisterScreen] Registration error:', error);
      showError('Bağlantı Hatası', 'Kayıt sırasında hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Notification Alert */}
      <NotificationAlert
        type={notification.type}
        title={notification.title}
        message={notification.message}
        visible={notification.visible}
        onClose={hideNotification}
        autoHide={true}
        duration={2000}
      />
      
      <PremiumTransition isVisible={isVisible} duration={800} disableGlow={true}>
        <AuthPage
          isLogin={false}
          formData={formData}
          onChange={(key, value) => setFormData(prev => ({ ...prev, [key]: value }))}
          onSubmit={handleRegister}
          onToggle={navigateToLogin}
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
