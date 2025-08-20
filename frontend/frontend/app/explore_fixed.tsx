/**
 * 🔍 EXPLORE TAB - TOKEN YÖNETİMİ EĞİTİMİ
 * 
 * Bu dosya, React Native uygulamasında token'ın nasıl alındığını ve kullanıldığını gösterir.
 * 
 * 🔑 TOKEN ALMA YÖNTEMLERİ:
 * 
 * 1. ✅ AsyncStorage'dan Token Alma (Önerilen)
 *    - await AsyncStorage.getItem('userToken')
 *    - Login sırasında kaydedilen JWT token'ı alır
 *    - Güvenli ve sürekli erişim sağlar
 * 
 * 2. ✅ AuthContext'ten Durum Alma
 *    - useAuth() hook'u ile isAuthenticated durumu
 *    - Global authentication state yönetimi
 *    - Component re-render optimizasyonu
 * 
 * 3. ❌ Props ile Token Geçme (Önerilmez)
 *    - Component tree'de token aktarımı karmaşık
 *    - Prop drilling problemi yaratır
 * 
 * 🔄 TOKEN LIFECYCLE:
 * Login → AsyncStorage.setItem → useEffect → API Calls
 * 
 * 🛡️ GÜVENLİK:
 * - Token'lar hassas bilgidir, console.log'da tam gösterilmez
 * - API çağrılarında Authorization header'ında kullanılır
 * - Logout'ta AsyncStorage'dan silinir
 * 
 * 🧪 DEBUG:
 * - Token debug butonu ile anlık durum kontrol edilebilir
 * - Console.log'lar ile token akışı izlenebilir
 */

import React, { useEffect, useState, useCallback } from "react";
import { FlatList, View, Alert, RefreshControl, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProducts, Product } from "../services/catalog";
import ProductCard from "../components/ProductCard";
import FilterModal from "../components/FilterModal";
import { addToCart } from "../services/cart";
import { addToFavorites, isFavorite } from "../services/favorites";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuroraHeader from "../components/AuroraHeader";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { Stack } from "expo-router";

export default function ExploreScreen() {
  console.log('[ExploreScreen] Component mount edildi');
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <ExploreContent />
    </>
  );
}

function ExploreContent() {
  console.log('[ExploreContent] Component başlatılıyor');
  // 🔑 TOKEN ALMA YÖNTEMLERİ:
  
  // 1. AuthContext'ten sadece authentication durumu al
  const { isAuthenticated, userInfo } = useAuth();
  console.log('[ExploreContent] Auth durum:', { isAuthenticated, userInfo });
  
  // 2. AsyncStorage'dan token al (Ana yöntem)
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  
  const [filter, setFilter] = useState<{brandId?:number; categoryId?:number}>({});
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // 🔧 TOKEN ALMA FONKSİYONU
  const getTokenFromStorage = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('[ExploreTab] Token alındı:', token ? 'BAŞARILI' : 'BOŞ');
      return token;
    } catch (error) {
      console.error('[ExploreTab] Token alınamadı:', error);
      return null;
    }
  };

  // 🔄 TOKEN'I YÜKLE ve ürünleri al
  useEffect(() => {
    console.log('[ExploreContent] useEffect çalıştı - isAuthenticated:', isAuthenticated);
    const initializeData = async () => {
      console.log('[ExploreContent] initializeData başladı');
      // Token'i yükle
      if (isAuthenticated) {
        console.log('[ExploreContent] Kullanıcı authenticated, token yükleniyor...');
        const token = await getTokenFromStorage();
        setCurrentToken(token);
        console.log('[ExploreContent] Token yüklendi:', token ? 'BAŞARILI' : 'BOŞ');
      } else {
        console.log('[ExploreContent] Kullanıcı authenticated değil');
        setCurrentToken(null);
      }
      
      // İlk ürün yüklemesi
      console.log('[ExploreContent] İlk ürün yüklemesi başlatılıyor...');
      await loadProducts();
    };
    
    initializeData();
  }, [isAuthenticated]);

  // Filtre değiştiğinde ürünleri yeniden yükle
  useEffect(() => {
    console.log('[ExploreContent] Filtre değişti:', filter);
    loadProducts();
  }, [filter]);

  const loadProducts = async () => {
    console.log('[ExploreContent] loadProducts başladı');
    setLoading(true);
    try { 
      console.log('[ExploreContent] Ürünler yükleniyor, filtre:', filter);
      console.log('[ExploreContent] getProducts fonksiyonu çağrılıyor...');
      const products = await getProducts(filter);
      console.log('[ExploreContent] getProducts yanıtı:', products);
      setItems(products);
      console.log('[ExploreContent] Yüklenen ürün sayısı:', products.length);
      
      // Favorileri kontrol et
      const favIds = new Set<number>();
      for (const product of products) {
        if (await isFavorite(product.id)) {
          favIds.add(product.id);
        }
      }
      setFavoriteIds(favIds);
      console.log('[ExploreContent] Favoriler yüklendi:', favIds.size);
    } catch (error) {
      console.error('[ExploreContent] Ürün yükleme hatası:', error);
      Alert.alert("❌ Hata", `Ürünler yüklenirken hata oluştu: ${error}`);
    }
    finally { 
      setLoading(false); 
      console.log('[ExploreContent] loadProducts tamamlandı');
    }
  };

  // 🛠️ DEBUG: TOKEN DURUMUNU GÖSTER
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

  // Sayfa odaklandığında favorileri güncelle
  useFocusEffect(
    useCallback(() => {
      const updateFavorites = async () => {
        if (items.length > 0) {
          const favIds = new Set<number>();
          for (const product of items) {
            if (await isFavorite(product.id)) {
              favIds.add(product.id);
            }
          }
          setFavoriteIds(favIds);
        }
      };
      
      updateFavorites();
    }, [items])
  );

  // 🛒 SEPETE EKLEME FONKSİYONU (Token ile)
  const onAdd = async (p: Product) => {
    // Token kontrolü
    if (!currentToken) { 
      Alert.alert(
        "🔐 Giriş Gerekli", 
        "Sepete ürün eklemek için giriş yapmanız gerekiyor.",
        [
          { text: "Tamam", style: "default" },
          { text: "Token Debug", onPress: showTokenDebug }
        ]
      ); 
      return; 
    }
    
    try {
      console.log('[ExploreTab] Sepete ekleniyor:', p.name, 'Token:', currentToken.substring(0, 20) + '...');
      await addToCart(currentToken, p.id, 1);
      Alert.alert("✅ Sepet", `"${p.name}" sepete eklendi!`);
    } catch (error) {
      console.error('[ExploreTab] Sepete ekleme hatası:', error);
      Alert.alert("❌ Hata", "Ürün sepete eklenirken hata oluştu.");
    }
  };

  // ❤️ FAVORİLERE EKLEME FONKSİYONU
  const onAddToFavorites = async (p: Product) => {
    try {
      const isFav = favoriteIds.has(p.id);
      
      if (isFav) {
        // Favorilerden çıkar
        const { removeFromFavorites } = await import("../services/favorites");
        await removeFromFavorites(p.id);
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(p.id);
          return newSet;
        });
        Alert.alert("💔 Favoriler", `"${p.name}" favorilerden çıkarıldı.`);
      } else {
        // Favorilere ekle
        await addToFavorites(p);
        setFavoriteIds(prev => new Set(prev).add(p.id));
        Alert.alert("❤️ Favoriler", `"${p.name}" favorilere eklendi!`);
      }
    } catch (error) {
      console.error('[ExploreTab] Favori işlemi hatası:', error);
      Alert.alert("❌ Hata", "Favori işlemi sırasında hata oluştu.");
    }
  };

  // 📊 FİLTRE DURUMU GÖSTERGESİ
  const getFilterText = () => {
    const parts = [];
    if (filter.brandId) parts.push("Marka");
    if (filter.categoryId) parts.push("Kategori");
    return parts.length > 0 ? parts.join(" + ") + " Filtreli" : "Tüm Ürünler";
  };

  return (
    <View style={styles.container}>
      {/* AURORA HEADER */}
      <AuroraHeader />
      
      {/* PAGE CONTENT */}
      <View style={styles.pageContent}>
        {/* Başlık ve Filter Controls */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Keşfet</Text>
          <View style={styles.headerRight}>
            <Pressable 
              style={[
                styles.filterButton,
                (filter.brandId || filter.categoryId) && styles.filterButtonActive
              ]} 
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons name="filter" size={18} color={
                (filter.brandId || filter.categoryId) ? "#0B0B0B" : "#C48913"
              } />
              <Text style={[
                styles.filterButtonText,
                (filter.brandId || filter.categoryId) && styles.filterButtonTextActive
              ]}>
                Filtre
              </Text>
            </Pressable>
            
            <Pressable style={styles.debugButtonSmall} onPress={showTokenDebug}>
              <Text style={styles.debugButtonTextSmall}>T</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          {/* FİLTRE DURUM BAR'I */}
          {(filter.brandId || filter.categoryId) && (
            <View style={styles.filterStatusBar}>
              <Text style={styles.filterStatusText}>{getFilterText()}</Text>
              <Pressable 
                onPress={() => setFilter({})} 
                style={styles.clearFilterButton}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </Pressable>
            </View>
          )}

          <FlatList
            data={items}
            keyExtractor={(x) => String(x.id)}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadProducts} />}
            ListEmptyComponent={
              loading ? null : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={64} color="#666" />
                  <Text style={styles.emptyTitle}>Ürün bulunamadı</Text>
                  <Text style={styles.emptySubtitle}>
                    {(filter.brandId || filter.categoryId) 
                      ? "Seçilen filtrelere uygun ürün yok. Filtreleri değiştirmeyi deneyin."
                      : "Henüz ürün eklenmemiş."
                    }
                  </Text>
                </View>
              )
            }
            renderItem={({ item }) => (
              <View style={styles.productContainer}>
                <ProductCard 
                  item={item} 
                  onAdd={onAdd} 
                  onAddToFavorites={onAddToFavorites}
                  isFavorite={favoriteIds.has(item.id)}
                  showFavoriteButton={true}
                />
              </View>
            )}
          />
        </View>
        
        {/* FILTER MODAL */}
        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          value={filter}
          onChange={setFilter}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  pageTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C48913',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: '#C48913',
    borderColor: '#C48913',
  },
  filterButtonText: {
    color: '#C48913',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  filterButtonTextActive: {
    color: '#0B0B0B',
  },
  debugButtonSmall: {
    backgroundColor: '#C48913',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  debugButtonTextSmall: {
    color: '#0B0B0B',
    fontSize: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  content: {
    flex: 1,
  },
  filterStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filterStatusText: {
    color: '#C48913',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    flex: 1,
  },
  clearFilterButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  productContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
    minHeight: 400,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});
