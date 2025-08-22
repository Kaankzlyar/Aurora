import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { registerUser } from '../../api/auth';
import { AuthPage } from '../../components/AuthPage';
import { PremiumTransition } from '../../components/PremiumTransition';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger premium entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Şifreler eşleşmiyor');
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

      if (result.message === 'User registered successfully.') {
        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        router.replace('/(auth)/login');
      } else if (result.message && result.message.includes('zaten kayıtlı')) {
        // Handle duplicate email error
        alert('Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta adresi kullanın veya giriş yapmayı deneyin.');
      } else {
        alert(result.message || 'Kayıt sırasında hata oluştu');
      }
    } catch (error) {
      console.error('[RegisterScreen] Registration error:', error);
      alert('Kayıt sırasında hata oluştu');
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
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
