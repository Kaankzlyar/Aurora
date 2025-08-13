// components/LoginForm.tsx
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../api/auth';
import { AuthPage } from './AuthPage';

export default function LoginForm({ onSuccess, onToggle }: { onSuccess: () => void; onToggle: () => void }) {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async () => {
    try {
      const result = await loginUser(formData.email, formData.password);
      
      if (result?.token) {
        await AsyncStorage.setItem('userToken', result.token);
        alert('Giriş başarılı!');
        onSuccess();
      } else {
        alert(result?.message || 'Giriş başarısız');
      }
    } catch (error) {
      alert('Giriş sırasında hata oluştu: ' + (error as any)?.message);
    }
  };

  return (
    <AuthPage
      isLogin
      formData={formData}
      onChange={(key, value) => setFormData(prev => ({ ...prev, [key]: value }))}
      onSubmit={handleLogin}
      onToggle={onToggle}
    />
  );
}
