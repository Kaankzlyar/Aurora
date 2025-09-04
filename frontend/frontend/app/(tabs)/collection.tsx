/**
 * 🛒 COLLECTION TAB - SEPET YÖNETİMİ VE TOKEN KULLANIMI
 * 
 * Bu dosya, e-ticaret uygulamasında sepet işlemlerinin token ile nasıl yapıldığını gösterir.
 * 
 * 🔑 TOKEN YÖNETİMİ:
 * 
 * 1. ✅ AsyncStorage'dan Token Alma
 *    - await AsyncStorage.getItem('userToken')
 *    - Sepet verilerini almak için gerekli
 * 
 * 2. ✅ AuthContext ile Durum Kontrolü
 *    - isAuthenticated ile giriş durumu
 *    - Token otomatik yükleme
 * 
 * 🛒 SEPET İŞLEMLERİ:
 * - Sepet görüntüleme (getCart)
 * - Ürün miktarını artırma/azaltma (updateCartItem)
 * - Ürün silme (removeFromCart)
 * - Sepeti temizleme (clearCart)
 * 
 * 🔒 GÜVENLİK:
 * - Tüm API çağrıları token ile yapılır
 * - Token yoksa sepet işlemleri bloklanır
 * - Authorization header otomatik eklenir
 */

import React, { useCallback, useState, useEffect } from "react";
import { View, Text, FlatList, Image, Pressable, ActivityIndicator, Alert, StyleSheet, Modal, ScrollView } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { CartItem, CartSummary, getCart, updateCartItem, removeFromCart, clearCart } from "../../services/cart";
import { imgUri } from "../../api/http";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuroraHeader from "../../components/AuroraHeader";
import SilverText from "../../components/SilverText";
import { Ionicons } from "@expo/vector-icons";
import GoldText from "@/components/GoldText";
import { LinearGradient } from 'expo-linear-gradient';

export default function CollectionTab() {
  // 🔑 TOKEN ALMA SİSTEMİ
  
  // 1. AuthContext'ten authentication durumu al
  const { isAuthenticated, userInfo } = useAuth();
  
  // 2. Local state'te token sakla
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [data, setData] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);
  


  // Number formatting function for Turkish currency
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // KDV hesaplama fonksiyonu (%18 - Türkiye standart KDV oranı)
  const calculateVAT = (totalWithVAT: number) => {
    const vatRate = 0.18;
    const subtotalWithoutVat = totalWithVAT / (1 + vatRate);
    const vatAmount = totalWithVAT - subtotalWithoutVat;
    return {
      subtotalWithoutVat,
      vatAmount,
      vatRate
    };
  };

  // 🔧 TOKEN ALMA FONKSİYONU
  const getTokenFromStorage = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token;
    } catch (error) {
      console.error('[CollectionTab] Token alınamadı:', error);
      return null;
    }
  };



  // 🔄 TOKEN YÜKLEMECini başlat
  useEffect(() => {
    const loadToken = async () => {
      setLoading(true);
      const token = await getTokenFromStorage();
      setCurrentToken(token);
      
      // If we have a token, try to load cart data
      if (token) {
        try {
          const result = await getCart(token);
          setData(result);
        } catch (error) {
          console.error('[CollectionTab] Sepet verisi yüklenemedi:', error);
        }
      }
      
      setLoading(false);
    };
    
    loadToken();
  }, [isAuthenticated]);

  // 🔄 SEPET YENİLEME FONKSİYONU
  const refresh = async () => {
    try {
      setLoading(true);
      
      // Get fresh token each time to avoid stale token issues
      const token = await getTokenFromStorage();
      if (!token) {
        Alert.alert("❌ Hata", "Oturum süresi dolmuş, lütfen tekrar giriş yapın.");
        return;
      }
      
      const result = await getCart(token);
      setData(result);
    } catch (error) {
      console.error('[CollectionTab] Sepet verisi alınamadı:', error);
      Alert.alert("❌ Hata", "Sepet verisi alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  // 📱 Sayfa odaklandığında sepeti yenile
  useFocusEffect(
    useCallback(() => {
      // Add a small delay to ensure AuthContext has updated
      const checkAndRefresh = async () => {
        // Check if we have a token in storage as backup verification
        const token = await getTokenFromStorage();
        
        if (isAuthenticated || token) {
          refresh();
        }
      };
      
      // Small delay to allow context to update after navigation
      setTimeout(checkAndRefresh, 200);
    }, [isAuthenticated])
  );

  // 🚫 Giriş yapılmamışsa uyarı göster  
  // Show login screen only if definitely not authenticated AND no token exists
  if (!isAuthenticated && !currentToken && !loading) {
    return (
      <View style={styles.container}>
        <AuroraHeader />
        <View style={styles.pageContent}>
          <View style={[styles.titleSection, { flexDirection: 'row', alignItems: 'center' }]}>
            <Ionicons name="cart-outline" size={24} color="#ffffff" />
            <SilverText style={styles.pageTitle}>Sepetim</SilverText>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>🔐 Giriş Gerekli</Text>
            <Text style={styles.emptySubtitle}>
              {!isAuthenticated 
                ? "Sepetinizi görmek için giriş yapın" 
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

  

  // ➕ Ürün miktarını artır - Optimized UI update
  const inc = async (it: CartItem) => { 
    if (!currentToken) return;
    try {
      // 🚀 UI'da hemen güncelle (optimistic update)
      if (data) {
        const updatedItems = data.items.map(item => 
          item.productId === it.productId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        
        // Toplamları yeniden hesapla
        const newTotalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        setData({
          items: updatedItems,
          totalQuantity: newTotalQuantity,
          subtotal: newSubtotal
        });
      }
      
      // Backend'i güncelle (background'da)
      await updateCartItem(currentToken, it.productId, it.quantity + 1); 
    } catch (error) {
      Alert.alert("❌ Hata", "Ürün miktarı artırılamadı.");
      // Hata durumunda tekrar yükle
      refresh();
    }
  };

  // ➖ Ürün miktarını azalt - Optimized UI update
  const dec = async (it: CartItem) => {
    if (!currentToken) return;
    try {
      const newQuantity = it.quantity - 1;
      
      // 🚀 UI'da hemen güncelle (optimistic update)
      if (data) {
        if (newQuantity <= 0) {
          // Ürünü listeden çıkar
          const updatedItems = data.items.filter(item => item.productId !== it.productId);
          const newTotalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          setData({
            items: updatedItems,
            totalQuantity: newTotalQuantity,
            subtotal: newSubtotal
          });
        } else {
          // Miktarı azalt
          const updatedItems = data.items.map(item => 
            item.productId === it.productId 
              ? { ...item, quantity: newQuantity }
              : item
          );
          
          const newTotalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          setData({
            items: updatedItems,
            totalQuantity: newTotalQuantity,
            subtotal: newSubtotal
          });
        }
      }
      
      // Backend'i güncelle (background'da)
      if (newQuantity <= 0) {
        await removeFromCart(currentToken, it.productId);
      } else {
        await updateCartItem(currentToken, it.productId, newQuantity);
      }
    } catch (error) {
      Alert.alert("❌ Hata", "Ürün miktarı değiştirilemedi.");
      // Hata durumunda tekrar yükle
      refresh();
    }
  };

  return (
    <View style={styles.container}>
      {/* AURORA HEADER */}
      <AuroraHeader />
      
      {/* PAGE CONTENT */}
      <View style={styles.pageContent}>
        {/* Başlık ve Controls */}
        <View style={styles.titleSection}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="cart-outline" size={24} color="#ffffff" />
            <SilverText style={[styles.pageTitle, {marginLeft: 8}]}> Sepetim</SilverText>
          </View>
        </View>

        
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(it) => String(it.productId)}
          extraData={data} // Re-render when data changes
          removeClippedSubviews={true} // Performance için
          maxToRenderPerBatch={10} // Batch size küçük tut
          windowSize={5} // Memory usage için
          ItemSeparatorComponent={() => <View style={{ height:10 }} />}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Image source={{ uri: imgUri(item.imagePath) }}
                     style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <GoldText style={styles.productPrice}>{`${formatCurrency(item.price)} ₺`}</GoldText>
                <View style={styles.quantityControls}>
                  <Pressable onPress={() => dec(item)} style={styles.quantityButton}>
                    <Text style={styles.quantityButtonText}>-</Text>
                  </Pressable>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <Pressable onPress={() => inc(item)} style={styles.quantityButton}>
                    <Text style={styles.quantityButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>
              <GoldText style={{
                ...styles.lineTotal,
                fontSize: (item.price * item.quantity) > 99999 ? 12 : 
                         (item.price * item.quantity) > 9999 ? 14 : 16,
                flexShrink: 0,
                minWidth: 100
              }}>
                {`${formatCurrency(item.price * item.quantity)} ₺`}
              </GoldText>
            </View>
          )}
          ListFooterComponent={() => 
            data && data.items.length > 0 ? (
              <View style={styles.summary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Toplam Ürün:</Text>
                  <Text style={styles.summaryValue}>{data.totalQuantity}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Ara Toplam (KDV Hariç):</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(calculateVAT(data.subtotal).subtotalWithoutVat)} ₺
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>KDV (%18):</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(calculateVAT(data.subtotal).vatAmount)} ₺
                  </Text>
                </View>
                <View style={[styles.summaryRow, { alignItems: 'center' }]}>
                  <Text style={styles.summaryLabelBold}>Toplam (KDV Dahil):</Text>
                  <GoldText style={{
                    ...styles.summaryValueBold,
                    fontSize: data.subtotal > 99999 ? 14 : 
                             data.subtotal > 9999 ? 15 : 16,
                    flexShrink: 0,
                    textAlign: 'right',
                    minWidth: 100
                  }}>
                    {`${formatCurrency(data.subtotal)} ₺`}
                  </GoldText>
                </View>
                <Pressable 
                  style={styles.clearCartButton}
                  onPress={() => 
                    Alert.alert(
                      "Sepeti Temizle", 
                      "Tüm ürünleri sepetten çıkarmak istediğinizden emin misiniz?",
                      [
                        { text: "İptal", style: "cancel" },
                        { 
                          text: "Evet", 
                          onPress: () => {
                            // 🚀 UI'da hemen temizle
                            setData({
                              items: [],
                              totalQuantity: 0,
                              subtotal: 0
                            });
                            
                            // Backend'i temizle (background'da)
                            clearCart(currentToken!).catch(() => {
                              // Hata durumunda tekrar yükle
                              refresh();
                            });
                          }
                        }
                      ]
                    )
                  }
                >
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  <Text style={[styles.clearCartButtonText, { marginLeft: 4 }]}>Sepeti Temizle</Text>
                  </View>
                </Pressable>
                
                <Pressable 
                  style={styles.checkoutButton}
                  onPress={() => {
                    if (data && data.items.length > 0) {
                      router.push({
                        pathname: '/checkout',
                        params: { 
                          subtotal: data.subtotal.toString(),
                          totalQuantity: data.totalQuantity.toString()
                        }
                      });
                    }
                  }}
                >
                  <LinearGradient
                    colors={['#D4AF37', '#C48913', '#B8860B']}
                    style={styles.checkoutButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Ionicons name="card-outline" size={24} color="black" />
                      <Text style={[styles.checkoutButtonText, { marginLeft: 8 }]}>Ödeme Yap</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <View style={styles.emptyCart}>
                <Text style={styles.emptyCartText}>Sepetiniz boş</Text>
              </View>
            )
          }
        />
      </View>


    </View>
  );
}

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  pageContent: {
    flex: 1,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    minHeight: 60,
  },
  pageTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold',
  },


  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay_700Bold',
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
  cartItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start', // Üstten hizala
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    marginHorizontal: 16,
    minHeight: 110, // Sabit minimum yükseklik - layout shifting'i önler
    flexWrap: 'nowrap', // Tek satırda tut
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  productInfo: {
    flex: 1,
    minHeight: 86, // Image yüksekliği + padding
    justifyContent: 'space-between', // Content'i düzenli dağıt
  },
  productName: {
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  productPrice: {
    flexDirection:'row',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  quantityButtonText: {
    color: '#D4AF37',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
  },
  quantity: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat_500Medium',
    fontSize: 16,
    minWidth: 30,
    textAlign: 'center',
  },

  lineTotal: {
    minWidth: 100, // Biraz daha geniş - büyük sayılar için
    textAlign: 'right',
    fontFamily: 'Montserrat_600SemiBold',
    color: '#D4AF37',
    fontSize: 16,
    flexShrink: 0, // Text wrap olmasını önler
    flexWrap: 'nowrap', // Tek satırda kalmasını sağla
  },
  summary: {
    marginTop: 16,
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    marginHorizontal: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'nowrap', // Prevent wrapping
  },
  summaryLabel: {
    fontFamily: 'Montserrat_400Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  summaryValue: {
    fontFamily: 'Montserrat_500Medium',
    color: '#FFFFFF',
    fontSize: 14,
  },
  summaryLabelBold: {
    fontFamily: 'Montserrat_700Bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  summaryValueBold: {
    fontFamily: 'Montserrat_700Bold',
    color: '#D4AF37',
    fontSize: 16,
  },
  clearCartButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  clearCartButtonText: {
    color: '#FF6B6B',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  checkoutButton: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkoutButtonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: '#0B0B0B',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 16,
  },
  emptyCartText: {
    fontFamily: 'Montserrat_500Medium',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
  },
});
