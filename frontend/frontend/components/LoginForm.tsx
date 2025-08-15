import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, testServerConnection, getUserInfoFromToken } from '../api/auth';
import AuthPage from './AuthPage';

interface LoginFormProps {
  onSuccess: () => void;
  onToggle: () => void;
}

function LoginForm({ onSuccess, onToggle }: LoginFormProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });

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
        if (tokenUserInfo && (tokenUserInfo.email || tokenUserInfo.name)) {
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
        } else if (result.user || result.email) {
          // Fallback to response data
          userInfo = {
            name: result.user?.name || result.name || formData.email.split('@')[0] || 'Kullanıcı',
            email: result.user?.email || result.email || formData.email,
            firstName: result.user?.firstName || result.firstName,
            lastName: result.user?.lastName || result.lastName
          };
        } else {
          // Last fallback - use email username part
          userInfo = {
            name: formData.email.split('@')[0] || 'Kullanıcı',
            email: formData.email
          };
        }
        
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
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
