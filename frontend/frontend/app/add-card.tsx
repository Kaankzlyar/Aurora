import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { createCard } from '../services/cards';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddCardScreen() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    holderName: '',
    pan: '',
    expMonth: '',
    expYear: '',
    cvv: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateCardNumber = (pan: string) => {
    // Remove spaces and dashes
    const cleanPan = pan.replace(/\s/g, '').replace(/-/g, '');
    // Check if it's a valid card number (13-19 digits)
    return /^\d{13,19}$/.test(cleanPan);
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
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (!validateCardNumber(formData.pan)) {
      Alert.alert('Geçersiz Kart Numarası', 'Lütfen geçerli bir kart numarası girin.');
      return;
    }

    if (!validateExpiry(formData.expMonth, formData.expYear)) {
      Alert.alert('Geçersiz Son Kullanma Tarihi', 'Lütfen geçerli bir son kullanma tarihi girin.');
      return;
    }

    if (!validateCVV(formData.cvv)) {
      Alert.alert('Geçersiz CVV', 'CVV 3 veya 4 haneli olmalıdır.');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Hata', 'Oturum bilgisi bulunamadı.');
        return;
      }

      await createCard(token, {
        holderName: formData.holderName.trim(),
        pan: formData.pan.replace(/\s/g, '').replace(/-/g, ''),
        expMonth: parseInt(formData.expMonth),
        expYear: parseInt(formData.expYear),
        cvv: formData.cvv
      });
      
      Alert.alert(
        'Başarılı!',
        'Kart başarıyla eklendi.',
        [
          {
            text: 'Tamam',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Kart eklenirken hata:', error);
      Alert.alert('Hata', 'Kart eklenirken hata oluştu. Lütfen tekrar deneyin.');
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

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </Pressable>
          <Text style={styles.title}>Yeni Kart</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>Giriş yapmanız gerekiyor.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </Pressable>
        <Text style={styles.title}>Yeni Kart</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Ödeme kartınızı ekleyin. Kart bilgileriniz güvenli şekilde şifrelenerek saklanır.
        </Text>

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
              <Text style={styles.submitButtonText}>💳 Kartı Kaydet</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
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
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 50,
  },
  content: {
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
    marginTop: 32,
    marginBottom: 32,
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#0B0B0B',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
    marginTop: 100,
  },
});
