import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getMyAddresses, Address } from '../services/addresses';
import { getMyCards, Card } from '../services/cards';
import { checkout } from '../services/orders';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import  SilverText  from '../components/SilverText';

export default function CheckoutScreen() {
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams();
  const subtotal = parseFloat(params.subtotal as string) || 0;
  const totalQuantity = parseInt(params.totalQuantity as string) || 0;
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  const shippingFee = 0; // Ücretsiz kargo
  const grandTotal = subtotal + shippingFee;

  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setCurrentToken(token);
        if (token) {
          loadData(token);
        }
      } catch (error) {
        console.error('Token alınamadı:', error);
      }
    };
    getToken();
  }, []);

  const loadData = async (token: string) => {
    try {
      setLoading(true);
      const [addressesData, cardsData] = await Promise.all([
        getMyAddresses(token),
        getMyCards(token)
      ]);
      
      setAddresses(addressesData);
      setCards(cardsData);
      
      // İlk adres ve kartı seç
      if (addressesData.length > 0) setSelectedAddressId(addressesData[0].id);
      if (cardsData.length > 0) setSelectedCardId(cardsData[0].id);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      Alert.alert('Hata', 'Adres ve kart bilgileri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (currentToken) {
      await loadData(currentToken);
    }
    setRefreshing(false);
  };

  const handleCheckout = async () => {
    if (!selectedAddressId || !selectedCardId) {
      Alert.alert('Uyarı', 'Lütfen bir adres ve kart seçin.');
      return;
    }

    try {
      setCheckoutLoading(true);
      await checkout(currentToken!, {
        addressId: selectedAddressId,
        cardId: selectedCardId
      });
      
      Alert.alert(
        'Başarılı!', 
        'Siparişiniz başarıyla oluşturuldu.',
        [
          {
            text: 'Siparişlerimi Gör',
            onPress: () => router.push('/orders')
          },
                     {
             text: 'Ana Sayfa',
             onPress: () => router.push('/(tabs)/index')
           }
        ]
      );
    } catch (error) {
      console.error('Checkout hatası:', error);
      Alert.alert('Hata', 'Sipariş oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setCheckoutLoading(false);
    }
  };

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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </Pressable>
        <SilverText style={styles.title}>Ödeme</SilverText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Sipariş Özeti */}
        <View style={styles.section}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="receipt-outline" size={20} color="#D4AF37" />
            <SilverText style={[styles.sectionTitle, {marginLeft: 8}]}>Sipariş Özeti</SilverText>
          </View>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ürün Sayısı:</Text>
              <SilverText style={styles.summaryValue}>{totalQuantity} adet</SilverText>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ara Toplam:</Text>
              <SilverText style={styles.summaryValue}>{subtotal.toFixed(2)} ₺</SilverText>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Kargo:</Text>
              <SilverText style={styles.summaryValue}>{shippingFee.toFixed(2)} ₺</SilverText>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Toplam:</Text>
              <SilverText style={styles.totalValue}>{grandTotal.toFixed(2)} ₺</SilverText>
            </View>
          </View>
        </View>

        {/* Adres Seçimi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="location-outline" size={20} color="#D4AF37" />
              <SilverText style={[styles.sectionTitle, {marginLeft: 8, marginTop: 8}]}>Teslimat Adresi</SilverText>
            </View>
            <Pressable 
              style={styles.addButton}
              onPress={() => router.push('/add-address')}
            >
              <Text style={styles.addButtonText}>+ Yeni Adres</Text>
            </Pressable>
          </View>
          
          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Henüz adres eklenmemiş</Text>
              <Pressable 
                style={styles.addFirstButton}
                onPress={() => router.push('/add-address')}
              >
                <Text style={styles.addFirstButtonText}>İlk Adresinizi Ekleyin</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              {addresses.map((address) => (
                <Pressable
                  key={address.id}
                  style={[
                    styles.optionItem,
                    selectedAddressId === address.id && styles.selectedOption
                  ]}
                  onPress={() => setSelectedAddressId(address.id)}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{address.title}</Text>
                    <Text style={styles.optionDetails}>
                      {address.street} {address.buildingNo}
                      {address.apartmentNo && ` / ${address.apartmentNo}`}
                    </Text>
                    <Text style={styles.optionDetails}>
                      {address.neighborhood}, {address.district}, {address.city}
                    </Text>
                  </View>
                  {selectedAddressId === address.id && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedIndicatorText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Kart Seçimi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="card-outline" size={20} color="#D4AF37" />
            <SilverText style={[styles.sectionTitle, {marginLeft: 8, marginTop: 8}]}>Ödeme Kartı</SilverText>
            </View>
            <Pressable 
              style={styles.addButton}
              onPress={() => router.push('/add-card')}
            >
              <Text style={styles.addButtonText}>+ Yeni Kart</Text>
            </Pressable>
          </View>
          
          {cards.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Henüz kart eklenmemiş</Text>
              <Pressable 
                style={styles.addFirstButton}
                onPress={() => router.push('/add-card')}
              >
                <Text style={styles.addFirstButtonText}>İlk Kartınızı Ekleyin</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              {cards.map((card) => (
                <Pressable
                  key={card.id}
                  style={[
                    styles.optionItem,
                    selectedCardId === card.id && styles.selectedOption
                  ]}
                  onPress={() => setSelectedCardId(card.id)}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{card.holderName}</Text>
                    <Text style={styles.optionDetails}>
                      {card.brand} •••• {card.last4}
                    </Text>
                    <Text style={styles.optionDetails}>
                      {card.expMonth.toString().padStart(2, '0')}/{card.expYear}
                    </Text>
                  </View>
                  {selectedCardId === card.id && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedIndicatorText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Ödeme Butonu */}
        <View style={styles.checkoutSection}>
          <Pressable
            style={[
              styles.checkoutButton,
              (!selectedAddressId || !selectedCardId || checkoutLoading) && styles.checkoutButtonDisabled
            ]}
            onPress={handleCheckout}
            disabled={!selectedAddressId || !selectedCardId || checkoutLoading}
          >
            {checkoutLoading ? (
              <ActivityIndicator size="small" color="#0B0B0B" />
            ) : (
              <Text style={styles.checkoutButtonText}>
                💳 {grandTotal.toFixed(2)} ₺ Öde
              </Text>
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  summaryContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#CCCCCC',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    color: '#D4AF37',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
  },
  totalValue: {
    color: '#D4AF37',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
  },
  optionsContainer: {
    gap: 12,
  },
  optionItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 4,
  },
  optionDetails: {
    color: '#CCCCCC',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: '#0B0B0B',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptyState: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 16,
    textAlign: 'center',
  },
  addFirstButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addFirstButtonText: {
    color: '#0B0B0B',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  checkoutSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  checkoutButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#666',
  },
  checkoutButtonText: {
    color: '#0B0B0B',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
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
});
