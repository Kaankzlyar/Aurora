// screens/RegisterForm.tsx
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from '../api/auth';
import AuthPage from '../components/AuthPage';

export default function RegisterForm({ onSuccess, onToggle }: { onSuccess: () => void; onToggle: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Şifreler eşleşmiyor');
      return;
    }

    try {
      const result = await registerUser(formData.firstName, formData.lastName, formData.email, formData.password);

      if (result.message === 'User registered successfully.') {
        // Save user info to AsyncStorage
        const userInfo = {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName
        };
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        // If registration also returns a token, save it
        if (result.token) {
          await AsyncStorage.setItem('userToken', result.token);
        }
        
        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        onSuccess();
      } else if (result.message && result.message.includes('zaten kayıtlı')) {
        // Handle duplicate email error
        alert('Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta adresi kullanın veya giriş yapmayı deneyin.');
      } else {
        alert(result.message || 'Kayıt sırasında hata oluştu');
      }
    } catch (error) {
      alert('Kayıt sırasında hata oluştu');
    }
  };

  return (
    <AuthPage
      isLogin={false}
      formData={formData}
      onChange={(key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }))}
      onSubmit={handleRegister}
      onToggle={onToggle}
    />
  );
}
