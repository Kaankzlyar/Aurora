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

import React, { useEffect, useState } from "react";
import { FlatList, View, Alert, RefreshControl, Text, StyleSheet, Pressable } from "react-native";
import { getProducts, Product } from "../../services/catalog";
import ProductCard from "../../components/ProductCard";
import FilterBar from "../../components/FilterBar";
import { addToCart } from "../../services/cart";
import { addToFavorites, isFavorite } from "../../services/favorites";
import { useAuth } from "../../contexts/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import PageHeader from "../../components/PageHeader";

export default function ExploreTab() {
  // 🔑 TOKEN ALMA YÖNTEMLERİ:
  
  // 1. AuthContext'ten sadece authentication durumu al
  const { isAuthenticated, userInfo } = useAuth();
  
  // 2. AsyncStorage'dan token al (Ana yöntem)
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  
  const [filter, setFilter] = useState<{brandId?:number; categoryId?:number}>({});
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

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

  // 🔄 TOKEN'I YÜKLEMEÇini başlat
  useEffect(() => {
    const loadToken = async () => {
      const token = await getTokenFromStorage();
      setCurrentToken(token);
    };
    
    if (isAuthenticated) {
      loadToken();
    } else {
      setCurrentToken(null);
    }
  }, [isAuthenticated]);

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

  const load = async () => {
    setLoading(true);
    try { 
      const products = await getProducts(filter);
      setItems(products);
      
      // Favorileri kontrol et
      const favIds = new Set<number>();
      for (const product of products) {
        if (await isFavorite(product.id)) {
          favIds.add(product.id);
        }
      }
      setFavoriteIds(favIds);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

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
        const { removeFromFavorites } = await import("../../services/favorites");
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

  return (
    <View style={styles.container}>
      {/* PAGE HEADER */}
      <PageHeader 
        title="Keşfet" 
        rightComponent={
          <View style={styles.headerRight}>
            <Pressable style={styles.debugButtonSmall} onPress={showTokenDebug}>
              <Text style={styles.debugButtonTextSmall}>T</Text>
            </Pressable>
          </View>
        }
      />

      <View style={styles.content}>
        <FlatList
          data={items}
          keyExtractor={(x) => String(x.id)}
          numColumns={1}
          contentContainerStyle={{ padding:16, gap:12 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          ListHeaderComponent={<FilterBar value={filter} onChange={setFilter} />}
          renderItem={({ item }) => (
            <ProductCard 
              item={item} 
              onAdd={onAdd} 
              onAddToFavorites={onAddToFavorites}
              isFavorite={favoriteIds.has(item.id)}
              showFavoriteButton={true}
            />
          )}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    color: '#C48913',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    flex: 1,
  },
  debugButton: {
    backgroundColor: '#C48913',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  debugButtonText: {
    color: '#0B0B0B',
    fontSize: 10,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
