// components/RegisterForm.tsx
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { registerUser } from '../api/auth';
import { AuthPage } from './AuthPage';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const navigation = useNavigation();

  const handleRegister = async () => {
    console.log('Register button pressed'); // Debug log
    console.log('Form data:', formData); // Debug log
    
    if (formData.password !== formData.confirmPassword) {
      alert('Şifreler eşleşmiyor');
      return;
    }

    try {
      console.log('Calling registerUser...'); // Debug log
      const result = await registerUser(formData.firstName, formData.lastName, formData.email, formData.password);
      console.log('Register result:', result); // Debug log

      if (result.message === 'User registered successfully.') {
        alert('Kayıt başarılı');
        (navigation as any).navigate('Login');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Kayıt sırasında hata oluştu');
    }
  };

  return (
    <AuthPage
      isLogin={false}
      formData={formData}
      onChange={(key, value) => setFormData(prev => ({ ...prev, [key]: value }))}
      onSubmit={handleRegister}
      onToggle={() => (navigation as any).navigate('Login')}
    />
  );
}
