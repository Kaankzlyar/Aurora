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

export default function CollectionTab() {
  // 🔑 TOKEN ALMA SİSTEMİ
  
  // 1. AuthContext'ten authentication durumu al
  const { isAuthenticated, userInfo } = useAuth();
  
  // 2. Local state'te token sakla
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [data, setData] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 🔍 Simple filter modal state
  const [showFilterModal, setShowFilterModal] = useState(false);

  // 🔧 TOKEN ALMA FONKSİYONU
  const getTokenFromStorage = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('[CollectionTab] Token alındı:', token ? 'BAŞARILI' : 'BOŞ');
      return token;
    } catch (error) {
      console.error('[CollectionTab] Token alınamadı:', error);
      return null;
    }
  };

  // 🔍 TOKEN DEBUG FONKSİYONU
  const showTokenDebug = () => {
    Alert.alert(
      "🔑 Token Debug",
      `Authentication: ${isAuthenticated ? '✅ Giriş Yapılmış' : '❌ Giriş Yapılmamış'}\n\n` +
      `Token: ${currentToken ? '✅ Mevcut' : '❌ Yok'}\n\n` +
      `Token Preview: ${currentToken ? currentToken.substring(0, 30) + '...' : 'null'}\n\n` +
      `User Info: ${userInfo ? JSON.stringify(userInfo, null, 2) : 'null'}`,
      [{ text: "Tamam" }]
    );
  };

  // 🖥️ SERVER BAĞLANTI TESTİ
  const testServerConnection = async () => {
    Alert.alert("🔗 Server Test", "Backend bağlantısı test ediliyor...");
  };

  // 🔄 TOKEN YÜKLEMECini başlat
  useEffect(() => {
    const loadToken = async () => {
      console.log('[CollectionTab] Token yükleme başlatıldı');
      setLoading(true);
      const token = await getTokenFromStorage();
      setCurrentToken(token);
      console.log('[CollectionTab] Token yüklendi:', token ? 'BAŞARILI' : 'BOŞ');
      
      // If we have a token, try to load cart data
      if (token) {
        try {
          const result = await getCart(token);
          setData(result);
          console.log('[CollectionTab] Sepet verisi yüklendi:', result);
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
      console.log('[CollectionTab] Sepet verisi alınıyor...');
      setLoading(true);
      
      // Get fresh token each time to avoid stale token issues
      const token = await getTokenFromStorage();
      if (!token) {
        console.log('[CollectionTab] Token bulunamadı');
        Alert.alert("❌ Hata", "Oturum süresi dolmuş, lütfen tekrar giriş yapın.");
        return;
      }
      
      const result = await getCart(token);
      setData(result);
      console.log('[CollectionTab] Sepet verisi alındı:', result);
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
      console.log('[CollectionTab] Sayfa odaklandı, koşullar kontrol ediliyor...');
      console.log('[CollectionTab] isAuthenticated:', isAuthenticated);
      
      // Add a small delay to ensure AuthContext has updated
      const checkAndRefresh = async () => {
        // Check if we have a token in storage as backup verification
        const token = await getTokenFromStorage();
        console.log('[CollectionTab] Token check:', token ? 'FOUND' : 'NOT FOUND');
        
        if (isAuthenticated || token) {
          console.log('[CollectionTab] Auth verified, sepet yenileniyor...');
          refresh();
        } else {
          console.log('[CollectionTab] Auth not verified, sepet yenilenmeyecek');
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
          <View style={styles.titleSection}>
            <SilverText style={styles.pageTitle}>🛒 Sepetim</SilverText>
            <Pressable style={styles.debugButtonSmall} onPress={showTokenDebug}>
              <Text style={styles.debugButtonTextSmall}>?</Text>
            </Pressable>
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
          <SilverText style={styles.pageTitle}>🛒 Sepetim</SilverText>
          <View style={styles.headerRight}>
            <Pressable 
              onPress={() => setShowFilterModal(true)}
              style={styles.filterButton}
            >
              <Text style={styles.filterButtonText}>🔍</Text>
            </Pressable>
            <Pressable style={styles.debugButtonSmall} onPress={showTokenDebug}>
              <Text style={styles.debugButtonTextSmall}>T</Text>
            </Pressable>
            <Pressable style={[styles.debugButtonSmall, styles.serverButtonSmall]} onPress={testServerConnection}>
              <Text style={styles.debugButtonTextSmall}>S</Text>
            </Pressable>
          </View>
        </View>

        {/* Loading durumunda küçük bir banner göster - sadece sayfa yüklenirken */}
        {loading && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator size="small" color="#D4AF37" />
            <Text style={styles.loadingBannerText}>Sepet yükleniyor...</Text>
          </View>
        )}
        
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
                <Text style={styles.productPrice}>{item.price.toFixed(2)} ₺</Text>
                <View style={styles.quantityControls}>
                  <Pressable onPress={() => dec(item)} style={styles.quantityButton}>
                    <Text style={styles.quantityButtonText}>-</Text>
                  </Pressable>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <Pressable onPress={() => inc(item)} style={styles.quantityButton}>
                    <Text style={styles.quantityButtonText}>+</Text>
                  </Pressable>
                  <Pressable onPress={() => {
                    // 🚀 Sil butonu sadece 1 azaltır
                    if (item.quantity > 1) {
                      // Miktar 1'den fazlaysa sadece azalt
                      if (data) {
                        const updatedItems = data.items.map(it => 
                          it.productId === item.productId 
                            ? { ...it, quantity: it.quantity - 1 }
                            : it
                        );
                        
                        const newTotalQuantity = updatedItems.reduce((sum, it) => sum + it.quantity, 0);
                        const newSubtotal = updatedItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
                        
                        setData({
                          items: updatedItems,
                          totalQuantity: newTotalQuantity,
                          subtotal: newSubtotal
                        });
                      }
                      
                      // Backend'i güncelle
                      updateCartItem(currentToken!, item.productId, item.quantity - 1).catch(() => {
                        refresh();
                      });
                    } else {
                      // Miktar 1 ise tamamen sil
                      if (data) {
                        const updatedItems = data.items.filter(it => it.productId !== item.productId);
                        const newTotalQuantity = updatedItems.reduce((sum, it) => sum + it.quantity, 0);
                        const newSubtotal = updatedItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
                        
                        setData({
                          items: updatedItems,
                          totalQuantity: newTotalQuantity,
                          subtotal: newSubtotal
                        });
                      }
                      
                      // Backend'den sil
                      removeFromCart(currentToken!, item.productId).catch(() => {
                        refresh();
                      });
                    }
                  }} style={styles.removeButton}>
                    <Ionicons name="trash-outline" style={styles.removeButtonText} size={20} />
                  </Pressable>
                </View>
              </View>
              <Text style={[
                styles.lineTotal,
                // Dinamik font size - büyük sayılarda küçülür
                {
                  fontSize: (item.price * item.quantity) > 99999 ? 12 : 
                           (item.price * item.quantity) > 9999 ? 14 : 16
                }
              ]}>
                {(item.price * item.quantity).toFixed(2)} ₺
              </Text>
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
                  <Text style={styles.summaryLabelBold}>Toplam Tutar:</Text>
                  <Text style={[
                    styles.summaryValueBold,
                    // Dinamik font size - büyük toplam fiyatlarda küçülür
                    {
                      fontSize: data.subtotal > 99999 ? 14 : 
                               data.subtotal > 9999 ? 15 : 16
                    }
                  ]}>{data.subtotal.toFixed(2)} ₺</Text>
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
                  <Text style={styles.clearCartButtonText}>🗑️ Sepeti Temizle</Text>
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

      {/* Simple Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔍 Sepet Filtresi</Text>
              <Pressable onPress={() => setShowFilterModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Fiyat Aralığı</Text>
                <View style={styles.filterGrid}>
                  <Pressable style={styles.filterChip}>
                    <Text style={styles.filterChipText}>0-100 ₺</Text>
                  </Pressable>
                  <Pressable style={styles.filterChip}>
                    <Text style={styles.filterChipText}>100-500 ₺</Text>
                  </Pressable>
                  <Pressable style={styles.filterChip}>
                    <Text style={styles.filterChipText}>500+ ₺</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Pressable onPress={() => setShowFilterModal(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>İptal</Text>
              </Pressable>
              <Pressable onPress={() => setShowFilterModal(false)} style={styles.applyButton}>
                <Text style={styles.applyButtonText}>Uygula</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  debugButtonSmall: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  serverButtonSmall: {
    backgroundColor: '#4ECDC4',
  },
  debugButtonTextSmall: {
    color: '#0B0B0B',
    fontSize: 8,
    fontFamily: 'Montserrat_700Bold',
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
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    marginHorizontal: 16,
    minHeight: 110, // Sabit minimum yükseklik - layout shifting'i önler
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
    fontFamily: 'Montserrat_400Regular',
    color: '#D4AF37',
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
  removeButton: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  removeButtonText: {
    color: '#FF6B6B',
    fontFamily: 'Montserrat_500Medium',
    fontSize: 16,
  },
  lineTotal: {
    width: 90, // Biraz daha geniş - büyük sayılar için
    textAlign: 'right',
    fontFamily: 'Montserrat_600SemiBold',
    color: '#D4AF37',
    fontSize: 16,
    flexShrink: 0, // Text wrap olmasını önler
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
    marginBottom: 8,
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
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: '#D4AF37',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  loadingBannerText: {
    color: '#D4AF37',
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  // 🔍 Filter Button & Modal Styles
  filterButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    marginRight: 4,
  },
  filterButtonText: {
    color: '#0B0B0B',
    fontSize: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    width: '100%',
    maxHeight: '85%',
    borderWidth: 2,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  modalTitle: {
    color: '#D4AF37',
    fontSize: 20,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  closeButtonText: {
    color: '#D4AF37',
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
  },
  modalContent: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  filterSection: {
    marginVertical: 16,
  },
  filterSectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 12,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChipText: {
    color: '#D4AF37',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#0B0B0B',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
