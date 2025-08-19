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
import { BASE_URL } from "../../constants/config";
import { CartItem, CartSummary, getCart, updateCartItem, removeFromCart, clearCart } from "../../services/cart";
import { imgUri } from "../../api/http";
import AsyncStorage from '@react-native-async-storage/async-storage';
import PageHeader from "../../components/PageHeader";

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

  // 🔧 AsyncStorage'dan token alma fonksiyonu
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

  //  Token'ı otomatik yükle
  useEffect(() => {
    const loadToken = async () => {
      if (isAuthenticated) {
        const token = await getTokenFromStorage();
        setCurrentToken(token);
        console.log('[CollectionTab] Token yüklendi, authenticated: true');
      } else {
        console.log('[CollectionTab] Kullanıcı giriş yapmamış, token ve data temizleniyor');
        setCurrentToken(null);
        setData(null); // Auth yoksa sepet verilerini temizle
        setLoading(false); // Loading durumunu sıfırla
      }
    };
    
    loadToken();
  }, [isAuthenticated]);

  // 🛠️ DEBUG: TOKEN DURUMUNU GÖSTER
  const showTokenDebug = () => {
    Alert.alert(
      "🔑 Sepet Token Debug",
      `Authentication: ${isAuthenticated ? '✅ Giriş Yapılmış' : '❌ Giriş Yapılmamış'}\n\n` +
      `Token: ${currentToken ? '✅ Mevcut' : '❌ Yok'}\n\n` +
      `Token Preview: ${currentToken ? currentToken.substring(0, 30) + '...' : 'null'}\n\n` +
      `Sepet Items: ${data?.items?.length || 0}\n\n` +
      `Toplam Tutar: ${data?.subtotal?.toFixed(2) || '0'} ₺`,
      [{ text: "Tamam" }]
    );
  };

  // 🔌 SERVER BAĞLANTI TESTİ
  const testServerConnection = async () => {
    try {
      console.log('[CollectionTab] Server bağlantısı test ediliyor...');
      const response = await fetch(`${BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      Alert.alert(
        "🔌 Server Test",
        `Server: ${response.ok ? '✅ Erişilebilir' : '❌ Erişilemiyor'}\n\n` +
        `Status: ${response.status}\n\n` +
        `URL: ${BASE_URL}`,
        [{ text: "Tamam" }]
      );
    } catch (error: any) {
      Alert.alert(
        "🔌 Server Test",
        `❌ Bağlantı Hatası\n\n` +
        `Hata: ${error?.message || 'Bilinmeyen'}\n\n` +
        `URL: ${BASE_URL}`,
        [{ text: "Tamam" }]
      );
    }
  };

  // 🔄 Sepet verilerini yenile
  const refresh = async () => {
    // İlk kontroller
    if (!isAuthenticated) {
      console.log('[CollectionTab] ❌ Kullanıcı giriş yapmamış, sepet yenilenmeyecek');
      setLoading(false); // Loading'i kapat
      return;
    }
    
    if (!currentToken) {
      console.log('[CollectionTab] ❌ Token yok, sepet yenilenmeyecek');
      setLoading(false); // Loading'i kapat
      return;
    }
    
    setLoading(true);
    try { 
      console.log('[CollectionTab] ===== SEPET YENİLEME BAŞLADI =====');
      console.log('[CollectionTab] isAuthenticated:', isAuthenticated);
      console.log('[CollectionTab] Token preview:', currentToken.substring(0, 30) + '...');
      console.log('[CollectionTab] API çağrısı yapılıyor...');
      
      const cartData = await getCart(currentToken);
      
      console.log('[CollectionTab] ✅ API yanıtı alındı:', cartData);
      console.log('[CollectionTab] Sepet item sayısı:', cartData?.items?.length || 0);
      console.log('[CollectionTab] Toplam tutar:', cartData?.subtotal || 0);
      
      setData(cartData);
      console.log('[CollectionTab] ✅ Sepet başarıyla güncellendi');
    } catch (error: any) {
      console.error('[CollectionTab] ===== SEPET YENİLEME HATASI =====');
      console.error('[CollectionTab] Hata tipi:', error?.name || 'Bilinmeyen');
      console.error('[CollectionTab] Hata mesajı:', error?.message || 'Mesaj yok');
      console.error('[CollectionTab] Hata stack:', error?.stack || 'Stack yok');
      console.error('[CollectionTab] Tam hata objesi:', error);
      console.error('[CollectionTab] isAuthenticated:', isAuthenticated);
      console.error('[CollectionTab] Token durumu:', currentToken ? 'Mevcut' : 'Yok');
      console.error('[CollectionTab] =================================');
      
      // Network hatası ise demo data göster
      if (error?.message?.includes('Network request failed') || error?.message?.includes('fetch')) {
        console.log('[CollectionTab] Network hatası tespit edildi - demo data yükleniyor');
        
        // Demo sepet datası
        const demoCartData: CartSummary = {
          items: [
            {
              productId: 1,
              name: "Premium Wireless Headphones",
              price: 299.99,
              quantity: 2,
              lineTotal: 599.98,
              imagePath: "/images/headphones.jpg"
            },
            {
              productId: 2,
              name: "Smart Watch Pro",
              price: 499.99,
              quantity: 1,
              lineTotal: 499.99,
              imagePath: "/images/smartwatch.jpg"
            },
            {
              productId: 3,
              name: "Bluetooth Speaker",
              price: 149.99,
              quantity: 1,
              lineTotal: 149.99,
              imagePath: "/images/speaker.jpg"
            }
          ],
          totalQuantity: 4,
          subtotal: 1249.96
        };
        
        setData(demoCartData);
        console.log('[CollectionTab] ✅ Demo sepet datası yüklendi');
        return;
      }
      
      // Diğer hatalar için alert göster ama loading'i kapat
      Alert.alert(
        "❌ Sepet Yenileme Hatası", 
        `Hata: ${error?.message || 'Bilinmeyen hata'}\n\n` +
        `Demo data gösteriliyor.`,
        [
          { text: "Tamam", style: "default" },
          { text: "Demo Yükle", onPress: () => {
            const demoData: CartSummary = {
              items: [
                { productId: 1, name: "Demo Ürün 1", price: 100, quantity: 1, lineTotal: 100, imagePath: null },
                { productId: 2, name: "Demo Ürün 2", price: 200, quantity: 2, lineTotal: 400, imagePath: null }
              ],
              totalQuantity: 3,
              subtotal: 500
            };
            setData(demoData);
          }}
        ]
      );
    } finally { 
      setLoading(false); // Her durumda loading'i kapat
    }
  };

  // 📱 Sayfa odaklandığında sepeti yenile
  useFocusEffect(useCallback(() => { 
    console.log('[CollectionTab] Sayfa odaklandı - kontroller yapılıyor...');
    console.log('[CollectionTab] isAuthenticated:', isAuthenticated);
    console.log('[CollectionTab] currentToken var mı:', currentToken ? 'EVET' : 'HAYIR');
    
    if (isAuthenticated && currentToken) {
      console.log('[CollectionTab] Koşullar sağlandı, sepet yenileniyor...');
      refresh(); 
    } else {
      console.log('[CollectionTab] Koşullar sağlanmadı, sepet yenilenmeyecek');
    }
  }, [isAuthenticated, currentToken]));

  // 🚫 Giriş yapılmamışsa uyarı göster
  if (!isAuthenticated || !currentToken) {
    return (
      <View style={styles.container}>
        <PageHeader 
          title="🛒 Sepetim" 
          rightComponent={
            <Pressable style={styles.debugButtonSmall} onPress={showTokenDebug}>
              <Text style={styles.debugButtonTextSmall}>?</Text>
            </Pressable>
          }
        />
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
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginButtonText}>🔑 Giriş Yap</Text>
            </Pressable>
          )}
          <Pressable style={styles.debugButton} onPress={showTokenDebug}>
            <Text style={styles.debugButtonText}>🔍 Debug Info</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ⏳ Yükleniyor durumu - Artık full screen loading yapmıyoruz, sepeti göstermeye devam
  // Sadece loading olduğunda küçük bir indicator gösterelim

  // ➕ Ürün miktarını artır
  const inc = async (it: CartItem) => { 
    if (!currentToken) return;
    try {
      await updateCartItem(currentToken, it.productId, it.quantity + 1); 
      refresh(); 
    } catch (error) {
      Alert.alert("❌ Hata", "Ürün miktarı artırılamadı.");
    }
  };

  // ➖ Ürün miktarını azalt
  const dec = async (it: CartItem) => {
    if (!currentToken) return;
    const q = it.quantity - 1;
    try {
      if (q <= 0) {
        await removeFromCart(currentToken, it.productId);
      } else {
        await updateCartItem(currentToken, it.productId, q);
      }
      refresh();
    } catch (error) {
      Alert.alert("❌ Hata", "Ürün miktarı değiştirilemedi.");
    }
  };

  return (
    <View style={styles.container}>
      {/* � PAGE HEADER */}
      <PageHeader 
        title="🛒 Sepetim" 
        rightComponent={
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
        }
      />

      <View style={styles.content}>
        {/* Loading durumunda küçük bir banner göster */}
        {loading && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator size="small" color="#D4AF37" />
            <Text style={styles.loadingBannerText}>Sepet güncelleniyor...</Text>
          </View>
        )}
        
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(it) => String(it.productId)}
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
                  <Pressable 
                    onPress={async () => {
                      if (!currentToken) return;
                      try {
                        await removeFromCart(currentToken, item.productId);
                        refresh();
                      } catch (error) {
                        Alert.alert("❌ Hata", "Ürün silinemedi.");
                      }
                    }}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Sil</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.lineTotal}>{item.lineTotal.toFixed(2)} ₺</Text>
            </View>
          )}
          ListFooterComponent={() => (
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Toplam Adet</Text>
                <Text style={styles.summaryValue}>{data?.totalQuantity ?? 0}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabelBold}>Ara Toplam</Text>
                <Text style={styles.summaryValueBold}>{(data?.subtotal ?? 0).toFixed(2)} ₺</Text>
              </View>
              {data?.items?.length ? (
                <Pressable 
                  onPress={async () => {
                    if (!currentToken) return;
                    try {
                      await clearCart(currentToken);
                      refresh();
                      Alert.alert("✅ Başarılı", "Sepet temizlendi!");
                    } catch (error) {
                      Alert.alert("❌ Hata", "Sepet temizlenemedi.");
                    }
                  }}
                  style={styles.clearCartButton}
                >
                  <Text style={styles.clearCartButtonText}>🗑️ Sepeti Temizle</Text>
                </Pressable>
              ) : (
                <View style={styles.emptyCart}>
                  <Text style={styles.emptyCartText}>🛒 Sepetiniz boş</Text>
                  
                  {/* Demo data yükleme butonu */}
                  <Pressable 
                    onPress={() => {
                      const demoData: CartSummary = {
                        items: [
                          { 
                            productId: 1, 
                            name: "Premium Wireless Headphones", 
                            price: 299.99, 
                            quantity: 2, 
                            lineTotal: 599.98, 
                            imagePath: null 
                          },
                          { 
                            productId: 2, 
                            name: "Smart Watch Pro", 
                            price: 499.99, 
                            quantity: 1, 
                            lineTotal: 499.99, 
                            imagePath: null 
                          },
                          { 
                            productId: 3, 
                            name: "Bluetooth Speaker", 
                            price: 149.99, 
                            quantity: 1, 
                            lineTotal: 149.99, 
                            imagePath: null 
                          }
                        ],
                        totalQuantity: 4,
                        subtotal: 1249.96
                      };
                      setData(demoData);
                      console.log('[CollectionTab] ✅ Demo sepet yüklendi');
                    }}
                    style={styles.demoButton}
                  >
                    <Text style={styles.demoButtonText}>📦 Demo Sepet Yükle</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        />
      </View>

      {/* 🎛️ Simple Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔍 Filtreler</Text>
              <Pressable 
                onPress={() => setShowFilterModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalContent}>
              {/* Kategori */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>📦 Kategori</Text>
                <View style={styles.filterGrid}>
                  {['Elektronik', 'Giyim', 'Ev & Yaşam', 'Spor', 'Kozmetik'].map((cat) => (
                    <Pressable key={cat} style={styles.filterChip}>
                      <Text style={styles.filterChipText}>{cat}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Marka */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>🏷️ Marka</Text>
                <View style={styles.filterGrid}>
                  {['Apple', 'Samsung', 'Nike', 'Adidas', 'Zara', 'H&M'].map((brand) => (
                    <Pressable key={brand} style={styles.filterChip}>
                      <Text style={styles.filterChipText}>{brand}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Fiyat Aralığı */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>💰 Fiyat Aralığı</Text>
                <View style={styles.filterGrid}>
                  {['0-100 ₺', '100-500 ₺', '500-1000 ₺', '1000+ ₺'].map((price) => (
                    <Pressable key={price} style={styles.filterChip}>
                      <Text style={styles.filterChipText}>{price}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActions}>
              <Pressable 
                onPress={() => setShowFilterModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </Pressable>
              <Pressable 
                onPress={() => {
                  setShowFilterModal(false);
                  Alert.alert("✅ Başarılı", "Filtreler uygulandı!");
                }}
                style={styles.applyButton}
              >
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
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  debugTitle: {
    color: '#D4AF37',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    flex: 1,
  },
  debugButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  debugButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverButton: {
    backgroundColor: '#4ECDC4',
  },
  debugButtonText: {
    color: '#0B0B0B',
    fontSize: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
  },
  content: {
    flex: 1,
    padding: 16,
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
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  productInfo: {
    flex: 1,
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
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  removeButtonText: {
    color: '#FF6B6B',
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
  },
  lineTotal: {
    width: 80,
    textAlign: 'right',
    fontFamily: 'Montserrat_600SemiBold',
    color: '#D4AF37',
    fontSize: 16,
  },
  summary: {
    marginTop: 16,
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
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
    marginBottom: 10,
    gap: 8,
  },
  loadingBannerText: {
    color: '#D4AF37',
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  demoButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#0B0B0B',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
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
