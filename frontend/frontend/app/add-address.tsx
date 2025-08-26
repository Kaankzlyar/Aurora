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
import { createAddress } from '../services/addresses';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddAddressScreen() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    country: 'Türkiye',
    city: '',
    district: '',
    neighborhood: '',
    street: '',
    buildingNo: '',
    apartmentNo: '',
    postalCode: '',
    line2: '',
    contactPhone: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.title || !formData.city || !formData.district || 
        !formData.neighborhood || !formData.street || !formData.buildingNo) {
      Alert.alert('Eksik Bilgi', 'Lütfen gerekli alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Hata', 'Oturum bilgisi bulunamadı.');
        return;
      }

      await createAddress(token, formData);
      
      Alert.alert(
        'Başarılı!',
        'Adres başarıyla eklendi.',
        [
          {
            text: 'Tamam',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Adres eklenirken hata:', error);
      Alert.alert('Hata', 'Adres eklenirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </Pressable>
          <Text style={styles.title}>Yeni Adres</Text>
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
        <Text style={styles.title}>Yeni Adres</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Teslimat adresinizi ekleyin. Gerekli alanlar * ile işaretlenmiştir.
        </Text>

        {/* Adres Başlığı */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adres Başlığı *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="Ev, İş, Ofis vb."
            placeholderTextColor="#666"
          />
        </View>

        {/* Ülke */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ülke</Text>
          <TextInput
            style={styles.input}
            value={formData.country}
            onChangeText={(value) => handleInputChange('country', value)}
            placeholder="Türkiye"
            placeholderTextColor="#666"
          />
        </View>

        {/* Şehir */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Şehir *</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(value) => handleInputChange('city', value)}
            placeholder="İstanbul"
            placeholderTextColor="#666"
          />
        </View>

        {/* İlçe */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>İlçe *</Text>
          <TextInput
            style={styles.input}
            value={formData.district}
            onChangeText={(value) => handleInputChange('district', value)}
            placeholder="Kadıköy"
            placeholderTextColor="#666"
          />
        </View>

        {/* Mahalle */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mahalle *</Text>
          <TextInput
            style={styles.input}
            value={formData.neighborhood}
            onChangeText={(value) => handleInputChange('neighborhood', value)}
            placeholder="Fenerbahçe"
            placeholderTextColor="#666"
          />
        </View>

        {/* Sokak */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sokak/Cadde *</Text>
          <TextInput
            style={styles.input}
            value={formData.street}
            onChangeText={(value) => handleInputChange('street', value)}
            placeholder="Atatürk Caddesi"
            placeholderTextColor="#666"
          />
        </View>

        {/* Bina No */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bina No *</Text>
          <TextInput
            style={styles.input}
            value={formData.buildingNo}
            onChangeText={(value) => handleInputChange('buildingNo', value)}
            placeholder="15"
            placeholderTextColor="#666"
          />
        </View>

        {/* Daire No */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Daire No</Text>
          <TextInput
            style={styles.input}
            value={formData.apartmentNo}
            onChangeText={(value) => handleInputChange('apartmentNo', value)}
            placeholder="5"
            placeholderTextColor="#666"
          />
        </View>

        {/* Posta Kodu */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Posta Kodu</Text>
          <TextInput
            style={styles.input}
            value={formData.postalCode}
            onChangeText={(value) => handleInputChange('postalCode', value)}
            placeholder="34726"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>

        {/* Ek Bilgi */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ek Bilgi</Text>
          <TextInput
            style={styles.input}
            value={formData.line2}
            onChangeText={(value) => handleInputChange('line2', value)}
            placeholder="Site adı, blok bilgisi vb."
            placeholderTextColor="#666"
          />
        </View>

        {/* İletişim Telefonu */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>İletişim Telefonu</Text>
          <TextInput
            style={styles.input}
            value={formData.contactPhone}
            onChangeText={(value) => handleInputChange('contactPhone', value)}
            placeholder="+90 555 123 45 67"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
          />
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
              <Text style={styles.submitButtonText}>💾 Adresi Kaydet</Text>
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
