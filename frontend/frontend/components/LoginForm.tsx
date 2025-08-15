import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, testServerConnection, getUserInfoFromToken } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import AuthPage from './AuthPage';

interface LoginFormProps {
  onSuccess: () => void;
  onToggle: () => void;
}

function LoginForm({ onSuccess, onToggle }: LoginFormProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { updateUserInfo, login } = useAuth();

  const handleLogin = async () => {
    try {
      // First test the server connection
      console.log('[LoginForm] Testing server connection before login...');
      const connectionTest = await testServerConnection();
      
      if (!connectionTest.success) {
        alert(`Server bağlantısı başarısız: ${connectionTest.error}`);
        return;
      }
      
      console.log('[LoginForm] Server connection successful, proceeding with login...');
      const result = await loginUser(formData.email, formData.password);
      
      if (result?.token) {
        await AsyncStorage.setItem('userToken', result.token);
        
        // Try to extract user info from JWT token first
        const tokenUserInfo = getUserInfoFromToken(result.token);
        
        let userInfo;
        if (tokenUserInfo) {
          // Always use the login email, regardless of what's in the token
          const displayName = tokenUserInfo.fullName || 
                             tokenUserInfo.name || 
                             tokenUserInfo.username ||
                             `${tokenUserInfo.firstName || ''} ${tokenUserInfo.lastName || ''}`.trim() ||
                             formData.email.split('@')[0] || // Use email username part as fallback
                             'Kullanıcı';
          
          userInfo = {
            name: displayName,
            email: formData.email, // ALWAYS use the login email
            firstName: tokenUserInfo.firstName,
            lastName: tokenUserInfo.lastName,
            id: tokenUserInfo.id,
            username: tokenUserInfo.username,
            fullName: tokenUserInfo.fullName
          };
          
          console.log('[LoginForm] Created userInfo with login email:', userInfo);
        } else {
          // Fallback if token parsing fails
          userInfo = {
            name: formData.email.split('@')[0] || 'Kullanıcı',
            email: formData.email, // ALWAYS use the login email
          };
          
          console.log('[LoginForm] Created fallback userInfo with login email:', userInfo);
        }
        
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        // Call login in AuthContext with email
        login(formData.email);
        console.log('[LoginForm] Saved user info:', userInfo);
        
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
      onChange={(key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }))}
      onSubmit={handleLogin}
      onToggle={onToggle}
    />
  );
}

export default LoginForm;
