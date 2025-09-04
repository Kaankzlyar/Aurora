import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { createCard } from '../services/cards';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from '../hooks/useNotification';
import NotificationAlert from '../components/NotificationAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SilverText from '@/components/SilverText';

export default function AddCardScreen() {
  const { isAuthenticated } = useAuth();
  const { notification, showError, showSuccess, showWarning, hideNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    holderName: '',
    pan: '',
    expMonth: '',
    expYear: '',
    cvv: '',
  });

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setCurrentToken(token);
        console.log('[AddCard] Token checked:', token ? 'FOUND' : 'NOT_FOUND');
      } catch (error) {
        console.error('[AddCard] Error checking token:', error);
      } finally {
        setTokenLoading(false);
      }
    };
    checkToken();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateCardNumber = (pan: string) => {
    // Remove spaces and dashes
    const cleanPan = pan.replace(/\s/g, '').replace(/-/g, '');
    // Check if it's a valid card number (12-19 digits) - matches backend validation
    return /^\d{12,19}$/.test(cleanPan);
  };

  const validateExpiry = (month: string, year: string) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    if (expYear > currentYear + 20) return false;
    
    return true;
  };

  const validateCVV = (cvv: string) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.holderName || !formData.pan || !formData.expMonth || 
        !formData.expYear || !formData.cvv) {
      showWarning('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (!validateCardNumber(formData.pan)) {
      showWarning('Geçersiz Kart Numarası', 'Lütfen geçerli bir kart numarası girin.');
      return;
    }

    if (!validateExpiry(formData.expMonth, formData.expYear)) {
      showWarning('Geçersiz Son Kullanma Tarihi', 'Lütfen geçerli bir son kullanma tarihi girin.');
      return;
    }

    if (!validateCVV(formData.cvv)) {
      showWarning('Geçersiz CVV', 'CVV 3 veya 4 haneli olmalıdır.');
      return;
    }

    try {
      setLoading(true);
      const token = currentToken || await AsyncStorage.getItem('userToken');
      
      if (!token) {
        showError('Hata', 'Oturum bilgisi bulunamadı.');
        return;
      }

      await createCard(token, {
        holderName: formData.holderName.trim(),
        pan: formData.pan.replace(/\s/g, '').replace(/-/g, ''),
        expMonth: parseInt(formData.expMonth),
        expYear: parseInt(formData.expYear),
        cvv: formData.cvv
      });
      
      showSuccess('Başarılı!', 'Kart başarıyla eklendi.');
      
      // Navigate back after a short delay to let user see the success message
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error('Kart eklenirken hata:', error);
      showError('Hata', 'Kart eklenirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  if (!isAuthenticated && !currentToken && !tokenLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </Pressable>
          <SilverText style={styles.title}>Yeni Kart</SilverText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>🔐 Giriş Gerekli</Text>
          <Text style={styles.errorSubtext}>Kart eklemek için giriş yapmanız gerekiyor.</Text>
          <Pressable 
            style={styles.loginButton} 
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>🔑 Giriş Yap</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (tokenLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </Pressable>
          <SilverText style={styles.title}>Yeni Kart</SilverText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </Pressable>
        <SilverText style={styles.title}>Yeni Kart</SilverText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContent}>
        <Text style={styles.description}>
          Ödeme kartınızı ekleyin. Kart bilgileriniz güvenli şekilde şifrelenerek saklanır.
        </Text>

        {/* Test Card Info */}
        <View style={styles.testCardInfo}>
          <Text style={styles.testCardTitle}>Test Kartları:</Text>
          <Text style={styles.testCardText}>Visa: 4111 1111 1111 1111</Text>
          <Text style={styles.testCardText}>Mastercard: 5555 5555 5555 4444</Text>
          <Text style={styles.testCardText}>Amex: 3782 822463 10005</Text>
        </View>

        {/* Kart Sahibi */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kart Sahibi *</Text>
          <TextInput
            style={styles.input}
            value={formData.holderName}
            onChangeText={(value) => handleInputChange('holderName', value)}
            placeholder="Ad Soyad"
            placeholderTextColor="#666"
            autoCapitalize="words"
          />
        </View>

        {/* Kart Numarası */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kart Numarası *</Text>
          <TextInput
            style={styles.input}
            value={formData.pan}
            onChangeText={(value) => handleInputChange('pan', formatCardNumber(value))}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor="#666"
            keyboardType="numeric"
            maxLength={19} // 16 digits + 3 spaces
          />
        </View>

        {/* Son Kullanma Tarihi ve CVV */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Ay *</Text>
            <TextInput
              style={styles.input}
              value={formData.expMonth}
              onChangeText={(value) => handleInputChange('expMonth', value)}
              placeholder="12"
              placeholderTextColor="#666"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
          
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Yıl *</Text>
            <TextInput
              style={styles.input}
              value={formData.expYear}
              onChangeText={(value) => handleInputChange('expYear', value)}
              placeholder="2025"
              placeholderTextColor="#666"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>

        {/* CVV */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>CVV *</Text>
          <TextInput
            style={styles.input}
            value={formData.cvv}
            onChangeText={(value) => handleInputChange('cvv', value)}
            placeholder="123"
            placeholderTextColor="#666"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
        </View>

        {/* Güvenlik Notu */}
        <View style={styles.securityNote}>
          <Text style={styles.securityNoteText}>
            🔒 Kart bilgileriniz güvenli şekilde şifrelenerek saklanır. 
            CVV bilgisi sadece doğrulama için kullanılır ve saklanmaz.
          </Text>
        </View>

        {/* Kaydet Butonu */}
        <View style={styles.submitSection}>
          <Pressable
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#0B0B0B" />
            ) : (
              <LinearGradient
                colors={['#D4AF37', '#C48913', '#B8860B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitButtonGradient}
              >
                <Ionicons name="card" size={20} color="#0B0B0B" />
                <Text style={styles.submitButtonText}>Kartı Kaydet</Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </ScrollView>
      
      <NotificationAlert 
        type={notification.type} 
        title={notification.title}
        message={notification.message} 
        visible={notification.visible}
        onClose={hideNotification} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  title: {
    fontSize: 20,
    marginTop: 8,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  description: {
    color: '#CCCCCC',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  testCardInfo: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  testCardTitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 8,
  },
  testCardText: {
    color: '#D4AF37',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    borderWidth: 1,
    borderColor: '#333',
  },
  securityNote: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  securityNoteText: {
    color: '#D4AF37',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  submitSection: {
    marginTop: 12,
    marginBottom: 32,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  submitButtonText: {
    color: '#0B0B0B',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  errorText: {
    color: '#D4AF37',
    fontSize: 24,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#0B0B0B',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    marginTop: 16,
  },
});
