// components/LoginForm.tsx
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../api/auth';
import { AuthPage } from './AuthPage';

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const router = useRouter();

  const handleLogin = async () => {
    const result = await loginUser(formData.email, formData.password);
    if (result.token) {
      await AsyncStorage.setItem('token', result.token);
      router.push('/home');
    } else {
      alert(result.message || 'Giriş başarısız');
    }
  };

  return (
    <AuthPage
      isLogin
      formData={formData}
      onChange={(key, value) => setFormData(prev => ({ ...prev, [key]: value }))}
      onSubmit={handleLogin}
      onToggle={() => router.push('/register')}
    />
  );
}
