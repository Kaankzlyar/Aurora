import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getMyAddresses, Address } from '../services/addresses';
import { getMyCards, Card } from '../services/cards';
import { checkout } from '../services/orders';
import { getCart, CartItem } from '../services/cart';
import { imgUri } from '../api/http';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import SilverText from '../components/SilverText';
import AuroraHeader from '../components/AuroraHeader';
import GoldText from '@/components/GoldText';
import { useNotification } from '../hooks/useNotification';
import NotificationAlert from '../components/NotificationAlert';

export default function CheckoutScreen() {
  const { isAuthenticated } = useAuth();
  const { notification, showError, showSuccess, showWarning, hideNotification } = useNotification();
  const params = useLocalSearchParams();
  const subtotal = parseFloat(params.subtotal as string) || 0;
  const totalQuantity = parseInt(params.totalQuantity as string) || 0;
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  const shippingFee = 0; // Ücretsiz kargo
  const grandTotal = subtotal + shippingFee;

  // Number formatting function for Turkish currency
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 🔧 TOKEN ALMA FONKSİYONU
  const getTokenFromStorage = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('[CheckoutScreen] Token alındı:', token ? 'BAŞARILI' : 'BOŞ');
      return token;
    } catch (error) {
      console.error('[CheckoutScreen] Token alınamadı:', error);
      return null;
    }
  };

  useEffect(() => {
    const getToken = async () => {
      try {
        console.log('[CheckoutScreen] Token yükleme başlatıldı');
        console.log('[CheckoutScreen] isAuthenticated:', isAuthenticated);
        
        const token = await getTokenFromStorage();
        setCurrentToken(token);
        console.log('[CheckoutScreen] Token yüklendi:', token ? 'BAŞARILI' : 'BOŞ');
        
        if (token) {
          loadData(token);
        }
      } catch (error) {
        console.error('[CheckoutScreen] Token alınamadı:', error);
      }
    };
    getToken();
  }, [isAuthenticated]);

  const loadData = async (token: string) => {
    try {
      setLoading(true);
      const [addressesData, cardsData, cartData] = await Promise.all([
        getMyAddresses(token),
        getMyCards(token),
        getCart(token)
      ]);
      
      setAddresses(addressesData);
      setCards(cardsData);
      setCartItems(cartData.items);
      
      // İlk adres ve kartı seç
      if (addressesData.length > 0) setSelectedAddressId(addressesData[0].id);
      if (cardsData.length > 0) setSelectedCardId(cardsData[0].id);
    } catch (error) {
      console.error('[CheckoutScreen] Veri yüklenirken hata:', error);
      showError('Hata', 'Adres ve kart bilgileri yüklenirken hata oluştu.');
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
      showWarning('Uyarı', 'Lütfen bir adres ve kart seçin.');
      return;
    }

    try {
      setCheckoutLoading(true);
      await checkout(currentToken!, {
        addressId: selectedAddressId,
        cardId: selectedCardId
      });
      
      showSuccess('Başarılı!', 'Siparişiniz başarıyla oluşturuldu.');
      
      // Kısa gecikme sonrası hızlı fade animasyonu ile yönlendir
      setTimeout(() => {
        router.replace({
          pathname: '/orders',
          params: { 
            animation: 'fade',
            duration: 150 
          }
        });
      }, 500);
    } catch (error) {
      console.error('[CheckoutScreen] Checkout hatası:', error);
      showError('Hata', 'Sipariş oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // 🚫 Giriş yapılmamışsa uyarı göster  
  // Show login screen only if definitely not authenticated AND no token exists
  if (!isAuthenticated && !currentToken && !loading) {
    return (
      <View style={styles.container}>
        <AuroraHeader />
        <View style={styles.pageContent}>
          <View style={styles.titleSection}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="card-outline" size={36} color="#ffffff" />
              <SilverText style={[styles.pageTitle, {marginLeft: 12, marginTop: 4}]}>Ödeme</SilverText>
            </View>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>🔐 Giriş Gerekli</Text>
            <Text style={styles.emptySubtitle}>
              {!isAuthenticated 
                ? "Ödeme yapmak için giriş yapın" 
                : "Token yükleniyor, lütfen bekleyin..."
              }
            </Text>
            {!isAuthenticated && (
              <Pressable 
                style={styles.loginButton} 
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.loginButtonText}>🔑 Giriş Yap</Text>
              </Pressable>
            )}
          </View>
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
      {/* AURORA HEADER */}
      <AuroraHeader />
      
      {/* PAGE CONTENT */}
      <View style={styles.pageContent}>
        <View style={styles.titleSection}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="card-outline" size={36} color="#ffffff" />
            <SilverText style={[styles.pageTitle, {marginLeft: 12, marginTop: 4}]}>Ödeme</SilverText>
          </View>
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
          
          {/* Cart Items */}
          <View style={styles.cartItemsContainer}>
            {cartItems.map((item) => (
              <View key={item.productId} style={styles.cartItem}>
                <Image 
                  source={{ uri: imgUri(item.imagePath) }} 
                  style={styles.cartItemImage} 
                />
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemPrice}>{formatCurrency(item.price)} ₺</Text>
                  <Text style={styles.cartItemQuantity}>Adet: {item.quantity}</Text>
                </View>
                <Text style={styles.cartItemTotal}>
                  {formatCurrency(item.price * item.quantity)} ₺
                </Text>
              </View>
            ))}
          </View>
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ürün Sayısı:</Text>
              <SilverText style={styles.summaryValue}>{totalQuantity} adet</SilverText>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ara Toplam:</Text>
              <SilverText style={styles.summaryValue}>{formatCurrency(subtotal)} ₺</SilverText>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Kargo:</Text>
              <SilverText style={styles.summaryValue}>{formatCurrency(shippingFee)} ₺</SilverText>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Toplam:</Text>
              <SilverText style={styles.totalValue}>{formatCurrency(grandTotal)} ₺</SilverText>
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
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="card-outline" size={24} color="#0B0B0B" />
                <Text style={[styles.checkoutButtonText, {marginLeft: 8}]}>
                  {formatCurrency(grandTotal)} ₺ Öde
                </Text>
              </View>
            )}
          </Pressable>
        </View>
        </ScrollView>
      </View>
      
      {/* CUSTOM BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <Pressable 
          style={styles.navItem} 
          onPress={() => router.push('/(tabs)/index')}
        >
          <Ionicons name="home-outline" size={22} color="#666666" />
          <Text style={styles.navLabel}>Ana Sayfa</Text>
        </Pressable>
        
        <Pressable 
          style={styles.navItem} 
          onPress={() => router.push('/(tabs)/explore')}
        >
          <Ionicons name="search-outline" size={22} color="#666666" />
          <Text style={styles.navLabel}>Keşfet</Text>
        </Pressable>
        
        <Pressable 
          style={styles.navItem} 
          onPress={() => router.push('/(tabs)/favorites')}
        >
          <Ionicons name="heart-outline" size={22} color="#666666" />
          <Text style={styles.navLabel}>Favoriler</Text>
        </Pressable>
        
        <Pressable 
          style={styles.navItem} 
          onPress={() => router.push('/(tabs)/collection')}
        >
          <Ionicons name="bag-outline" size={22} color="#D4AF37" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Sepetim</Text>
        </Pressable>
        
        <Pressable 
          style={styles.navItem} 
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="person-circle-outline" size={22} color="#666666" />
          <Text style={styles.navLabel}>Profil</Text>
        </Pressable>
      </View>
      
      {/* Notification Alert */}
      <NotificationAlert
        type={notification.type}
        title={notification.title}
        message={notification.message}
        visible={notification.visible}
        onClose={hideNotification}
        autoHide={true}
        duration={5000}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 0,
    minHeight: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugButtonSmall: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  debugButtonTextSmall: {
    color: '#D4AF37',
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 0,
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
  cartItemsContainer: {
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 2,
  },
  cartItemPrice: {
    color: '#D4AF37',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 2,
  },
  cartItemQuantity: {
    color: '#CCCCCC',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  cartItemTotal: {
    color: '#D4AF37',
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'right',
    minWidth: 80,
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
    marginBottom: 100, // Alt menü için extra padding
  },
  checkoutButton: {
    backgroundColor: '#C48913',
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1A1A1A',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navLabel: {
    color: '#666666',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    marginTop: 4,
  },
  activeNavLabel: {
    color: '#D4AF37',
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
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#0B0B0B',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
});
