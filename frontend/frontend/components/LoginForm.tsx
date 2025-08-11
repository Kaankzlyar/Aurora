// components/LoginForm.tsx
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../api/auth';
import { AuthPage } from './AuthPage';

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigation = useNavigation();

  const handleLogin = async () => {
    const result = await loginUser(formData.email, formData.password);
    if (result.token) {
      await AsyncStorage.setItem('token', result.token);
      (navigation as any).navigate('Home');
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
      onToggle={() => (navigation as any).navigate('Register')}
    />
  );
}
