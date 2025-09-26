import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getMyAddresses, updateAddress, Address, CreateAddress } from '../services/addresses';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import SilverText from '../components/SilverText';
import AuroraHeader from '../components/AuroraHeader';
import { useNotification } from '../hooks/useNotification';
import NotificationAlert from '../components/NotificationAlert';

export default function EditAddressScreen() {
  const { isAuthenticated } = useAuth();
  const { notification, showError, showSuccess, showWarning, hideNotification } = useNotification();
  const params = useLocalSearchParams();
  const addressId = parseInt(params.id as string);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNo, setBuildingNo] = useState('');
  const [apartmentNo, setApartmentNo] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [line2, setLine2] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Get token and load address data
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setCurrentToken(token);
        
        if (token && addressId) {
          const addresses = await getMyAddresses(token);
          const address = addresses.find(a => a.id === addressId);
          
          if (address) {
            setTitle(address.title);
            setCountry(address.country);
            setCity(address.city);
            setDistrict(address.district);
            setNeighborhood(address.neighborhood);
            setStreet(address.street);
            setBuildingNo(address.buildingNo);
            setApartmentNo(address.apartmentNo || '');
            setPostalCode(address.postalCode || '');
            setLine2(address.line2 || '');
            setContactPhone(address.contactPhone || '');
          } else {
            showError('Hata', 'Adres bulunamadı.');
            router.back();
          }
        }
      } catch (error) {
        console.error('[EditAddress] Veri yüklenirken hata:', error);
        showError('Hata', 'Adres bilgileri yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [addressId]);

  const handleUpdate = async () => {
    if (!title.trim() || !country.trim() || !city.trim() || !district.trim() || 
        !neighborhood.trim() || !street.trim() || !buildingNo.trim()) {
      showWarning('Uyarı', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      setUpdating(true);
      
      const addressData: CreateAddress = {
        title: title.trim(),
        country: country.trim(),
        city: city.trim(),
        district: district.trim(),
        neighborhood: neighborhood.trim(),
        street: street.trim(),
        buildingNo: buildingNo.trim(),
        apartmentNo: apartmentNo.trim() || null,
        postalCode: postalCode.trim() || null,
        line2: line2.trim() || null,
        contactPhone: contactPhone.trim() || null,
      };

      await updateAddress(currentToken!, addressId, addressData);
      
      showSuccess('Başarılı!', 'Adres başarıyla güncellendi.');
      
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      console.error('[EditAddress] Güncelleme hatası:', error);
      showError('Hata', 'Adres güncellenirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setUpdating(false);
    }
  };

  if (!isAuthenticated && !currentToken) {
    return (
      <View style={styles.container}>
        <AuroraHeader />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>🔐 Giriş Gerekli</Text>
          <Text style={styles.emptySubtitle}>Adres düzenlemek için giriş yapın</Text>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AuroraHeader />
      
      <View style={styles.pageContent}>
        <View style={styles.titleSection}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#D4AF37" />
            </Pressable>
            <SilverText style={[styles.pageTitle, {marginLeft: 12}]}>Adres Düzenle</SilverText>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adres Başlığı *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Ev, İş, vs."
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ülke *</Text>
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={setCountry}
                placeholder="Türkiye"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
                <Text style={styles.label}>Şehir *</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="İstanbul"
                  placeholderTextColor="#666"
                />
              </View>
              
              <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
                <Text style={styles.label}>İlçe *</Text>
                <TextInput
                  style={styles.input}
                  value={district}
                  onChangeText={setDistrict}
                  placeholder="Kadıköy"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mahalle *</Text>
              <TextInput
                style={styles.input}
                value={neighborhood}
                onChangeText={setNeighborhood}
                placeholder="Fenerbahçe Mah."
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sokak/Cadde *</Text>
              <TextInput
                style={styles.input}
                value={street}
                onChangeText={setStreet}
                placeholder="Bağdat Caddesi"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
                <Text style={styles.label}>Bina No *</Text>
                <TextInput
                  style={styles.input}
                  value={buildingNo}
                  onChangeText={setBuildingNo}
                  placeholder="123"
                  placeholderTextColor="#666"
                />
              </View>
              
              <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
                <Text style={styles.label}>Daire No</Text>
                <TextInput
                  style={styles.input}
                  value={apartmentNo}
                  onChangeText={setApartmentNo}
                  placeholder="4"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Posta Kodu</Text>
              <TextInput
                style={styles.input}
                value={postalCode}
                onChangeText={setPostalCode}
                placeholder="34000"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adres Tarifi</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={line2}
                onChangeText={setLine2}
                placeholder="Ek adres bilgisi (opsiyonel)"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>İletişim Telefonu</Text>
              <TextInput
                style={styles.input}
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="+90 5XX XXX XX XX"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.buttonSection}>
            <Pressable
              onPress={handleUpdate}
              disabled={updating}
              style={[styles.updateButton, updating && styles.updateButtonDisabled]}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#0B0B0B" />
              ) : (
                <LinearGradient
                  colors={['#D4AF37', '#C48913', '#B8860B']}
                  style={styles.updateButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.updateButtonContent}>
                    <Ionicons name="checkmark-outline" size={24} color="#0B0B0B" />
                    <Text style={styles.updateButtonText}>Adresi Güncelle</Text>
                  </View>
                </LinearGradient>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
      
      <NotificationAlert
        type={notification.type}
        title={notification.title}
        message={notification.message}
        visible={notification.visible}
        onClose={hideNotification}
        autoHide={true}
        duration={3000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  pageContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 1,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 0,
    minHeight: 40,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  form: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  updateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  updateButtonDisabled: {
    opacity: 0.5,
  },
  updateButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#0B0B0B',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#D4AF37',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#0B0B0B',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
});
