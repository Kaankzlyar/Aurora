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
import { getMyCards, updateCard, Card, UpdateCard } from '../services/cards';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import SilverText from '../components/SilverText';
import AuroraHeader from '../components/AuroraHeader';
import { useNotification } from '../hooks/useNotification';
import NotificationAlert from '../components/NotificationAlert';

export default function EditCardScreen() {
  const { isAuthenticated } = useAuth();
  const { notification, showError, showSuccess, showWarning, hideNotification } = useNotification();
  const params = useLocalSearchParams();
  const cardId = parseInt(params.id as string);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [cardInfo, setCardInfo] = useState<Card | null>(null);
  
  // Form fields
  const [holderName, setHolderName] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');

  // Get token and load card data
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setCurrentToken(token);
        
        if (token && cardId) {
          const cards = await getMyCards(token);
          const card = cards.find(c => c.id === cardId);
          
          if (card) {
            setCardInfo(card);
            setHolderName(card.holderName);
            setExpMonth(card.expMonth.toString());
            setExpYear(card.expYear.toString());
          } else {
            showError('Hata', 'Kart bulunamadı.');
            router.back();
          }
        }
      } catch (error) {
        console.error('[EditCard] Veri yüklenirken hata:', error);
        showError('Hata', 'Kart bilgileri yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [cardId]);

  const handleUpdate = async () => {
    if (!holderName.trim()) {
      showWarning('Uyarı', 'Kart sahibi adı zorunludur.');
      return;
    }

    const monthNum = parseInt(expMonth);
    const yearNum = parseInt(expYear);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      showWarning('Uyarı', 'Geçerli bir ay giriniz (1-12).');
      return;
    }

    if (isNaN(yearNum) || yearNum < new Date().getFullYear() || yearNum > new Date().getFullYear() + 20) {
      showWarning('Uyarı', 'Geçerli bir yıl giriniz.');
      return;
    }

    try {
      setUpdating(true);
      
      const cardData: UpdateCard = {
        holderName: holderName.trim(),
        expMonth: monthNum,
        expYear: yearNum,
      };

      await updateCard(currentToken!, cardId, cardData);
      
      showSuccess('Başarılı!', 'Kart başarıyla güncellendi.');
      
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      console.error('[EditCard] Güncelleme hatası:', error);
      showError('Hata', 'Kart güncellenirken hata oluştu. Lütfen tekrar deneyin.');
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
          <Text style={styles.emptySubtitle}>Kart düzenlemek için giriş yapın</Text>
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
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </Pressable>
            <SilverText style={[styles.pageTitle, {marginLeft: 12}]}>Kart Düzenle</SilverText>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Mevcut Kart Bilgileri */}
          {cardInfo && (
            <View style={styles.cardInfo}>
              <Text style={styles.cardInfoTitle}>Mevcut Kart Bilgileri</Text>
              <View style={styles.cardDisplay}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardBrand}>{cardInfo.brand}</Text>
                  <Text style={styles.cardNumber}>•••• {cardInfo.last4}</Text>
                </View>
                <Text style={styles.cardNote}>
                  🔐 Güvenlik: Kart numarası değiştirilemez
                </Text>
              </View>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kart Sahibi Adı *</Text>
              <TextInput
                style={styles.input}
                value={holderName}
                onChangeText={setHolderName}
                placeholder="JOHN DOE"
                placeholderTextColor="#666"
                autoCapitalize="characters"
              />
            </View>

            <Text style={styles.sectionTitle}>Son Kullanma Tarihi</Text>
            <View style={styles.row}>
              <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
                <Text style={styles.label}>Ay *</Text>
                <TextInput
                  style={styles.input}
                  value={expMonth}
                  onChangeText={setExpMonth}
                  placeholder="12"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              
              <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
                <Text style={styles.label}>Yıl *</Text>
                <TextInput
                  style={styles.input}
                  value={expYear}
                  onChangeText={setExpYear}
                  placeholder="2025"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#D4AF37" />
              <Text style={styles.infoText}>
                Güvenlik nedeniyle sadece kart sahibi adı ve son kullanma tarihi güncellenebilir.
              </Text>
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
                    <Text style={styles.updateButtonText}>Kartı Güncelle</Text>
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
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  cardInfo: {
    marginBottom: 24,
  },
  cardInfoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 12,
  },
  cardDisplay: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardBrand: {
    color: '#D4AF37',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  cardNote: {
    color: '#CCCCCC',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  form: {
    paddingBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 16,
    marginTop: 8,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
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
