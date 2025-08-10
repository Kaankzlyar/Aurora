// components/RegisterForm.tsx
import { useState } from 'react';
import { useRouter } from 'expo-router';
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
  const router = useRouter();

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Şifreler eşleşmiyor');
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const result = await registerUser(fullName, formData.email, formData.password);

    if (result.message === 'User registered successfully.') {
      alert('Kayıt başarılı');
      router.push('/login');
    } else {
      alert(result.message);
    }
  };

  return (
    <AuthPage
      isLogin={false}
      formData={formData}
      onChange={(key, value) => setFormData(prev => ({ ...prev, [key]: value }))}
      onSubmit={handleRegister}
      onToggle={() => router.push('/login')}
    />
  );
}
