import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, getUserInfoFromToken } from '../../api/auth';
import { AuthPage } from '../../components/AuthPage';
import { PremiumTransition } from '../../components/PremiumTransition';
<<<<<<< HEAD
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
=======

export default function LoginScreen() {
>>>>>>> ffcb4278176d55c38840c162d432d16f57abc477
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
      console.log('[LoginScreen] 🔄 handleLogin function started');
      console.log('[LoginScreen] 📧 Attempting login with email:', formData.email);

      console.log('[LoginScreen] 🚀 Calling loginUser API...');
      const result = await loginUser(formData.email, formData.password);
      console.log('[LoginScreen] 📥 loginUser result received:', result);

      if (result?.accessToken) {
        console.log('[LoginScreen] ✅ AccessToken found, proceeding with login');
        console.log('[LoginScreen] 💾 Saving accessToken to AsyncStorage...');
        await AsyncStorage.setItem('userToken', result.accessToken);
        console.log('[LoginScreen] ✅ AccessToken saved successfully');

        console.log('[LoginScreen] 🔍 Extracting user info from JWT token...');
        // Try to extract user info from JWT token first
        const tokenUserInfo = await getUserInfoFromToken(result.accessToken);
        console.log('[LoginScreen] 📋 Token user info extracted:', tokenUserInfo);

        let userInfo;
        if (tokenUserInfo && (tokenUserInfo.email || tokenUserInfo.name)) {
          console.log('[LoginScreen] 🎯 Using info from JWT token');
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
          console.log('[LoginScreen] 👤 User info created from token:', userInfo);
        } else if (result.user || result.email) {
          console.log('[LoginScreen] 🔄 Using fallback response data');
          // Fallback to response data
          userInfo = {
            name: result.user?.name || result.name || formData.email.split('@')[0] || 'Kullanıcı',
            email: result.user?.email || result.email || formData.email,
            firstName: result.user?.firstName || result.firstName,
            lastName: result.user?.lastName || result.lastName
          };
          console.log('[LoginScreen] 👤 User info created from response:', userInfo);
        } else {
          console.log('[LoginScreen] ⚠️ Using last fallback - email username part');
          // Last fallback - use email username part
          userInfo = {
            name: formData.email.split('@')[0] || 'Kullanıcı',
            email: formData.email
          };
          console.log('[LoginScreen] 👤 User info created from fallback:', userInfo);
        }

        console.log('[LoginScreen] 💾 Saving user info to AsyncStorage...');
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        await AsyncStorage.setItem('userEmail', userInfo.email);
        console.log('[LoginScreen] ✅ User info saved successfully');
        console.log('[LoginScreen] 📝 Final saved user info:', userInfo);

<<<<<<< HEAD
        console.log('[LoginScreen] 🔄 Updating AuthContext state...');
        // Call the AuthContext login method to update the authentication state
        await login(userInfo.email);
        console.log('[LoginScreen] ✅ AuthContext state updated');

=======
>>>>>>> ffcb4278176d55c38840c162d432d16f57abc477
        console.log('[LoginScreen] 🧭 Navigating to main app...');
        // Navigate to main app
        router.replace('/(tabs)');
        console.log('[LoginScreen] ✅ Navigation completed');
      } else {
        console.log('[LoginScreen] ❌ No token found in result');
        console.log('[LoginScreen] 📋 Result object:', result);
        alert(result?.message || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('[LoginScreen] ❌ Login error occurred:', error);
      console.error('[LoginScreen] 📋 Error details:', error);
      alert('Giriş sırasında hata oluştu');
    }
  };

  const navigateToRegister = () => {
    router.push('/(auth)/register');
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
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
          onForgotPassword={handleForgotPassword}
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
