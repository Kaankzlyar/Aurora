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
    console.log("[LoginForm] Starting login process...");
    console.log("[LoginForm] Email:", JSON.stringify(formData.email));
    console.log("[LoginForm] Password provided:", formData.password ? "YES" : "NO");
    
    try {
      const result = await loginUser(formData.email, formData.password);
      
      if (result?.token) {
        console.log("[LoginForm] ✅ Login successful! Token received.");
        await AsyncStorage.setItem('userToken', result.token);
        alert('Giriş başarılı!');
        (navigation as any).navigate('Home');
      } else {
        console.log("[LoginForm] ❌ Login failed:", result?.message);
        alert(result?.message || 'Giriş başarısız');
      }
    } catch (error) {
      console.error("[LoginForm] Login error:", error);
      alert('Giriş sırasında hata oluştu: ' + (error as any)?.message);
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
