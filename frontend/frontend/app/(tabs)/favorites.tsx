/**
 * ❤️ FAVORITES TAB - FAVORİLER SAYFASı
 * 
 * Bu sayfa kullanıcının favorilerine eklediği ürünleri gösterir.
 * 
 * ✨ ÖZELLİKLER:
 * - Favori ürünleri listeleme
 * - Favorilerden çıkarma
 * - Sepete ekleme
 * - Favorileri temizleme
 * - Token kontrolü
 * 
 * 📱 KULLANIM:
 * - Explore sayfasından kalp ikonuna tıklayarak ürün eklenir
 * - Bu sayfada favoriler görüntülenir ve yönetilir
 * - Giriş yapmadan sepete ekleme yapılamaz
 */

import React, { useEffect, useState, useCallback } from "react";
import { FlatList, View, Alert, RefreshControl, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFavorites, removeFromFavorites, clearFavorites, FavoriteProduct } from "../../services/favorites";
import ProductCard from "../../components/ProductCard";
import { addToCart } from "../../services/cart";
import { useAuth } from "../../contexts/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import PageHeader from "../../components/PageHeader";
import { useFocusEffect } from "@react-navigation/native";

export default function FavoritesTab() {
  const { isAuthenticated } = useAuth();
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔧 TOKEN ALMA FONKSİYONU
  const getTokenFromStorage = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token;
    } catch (error) {
      console.error('[FavoritesTab] Token alınamadı:', error);
      return null;
    }
  };

  // 🔄 TOKEN YÜKLEMEÇini başlat
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

  // 📋 FAVORİLERİ YÜKLEMECini
  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favs = await getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('[FavoritesTab] Favoriler yüklenemedi:', error);
      Alert.alert("❌ Hata", "Favoriler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // 📱 Sayfa odaklandığında favorileri yenile
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  // 💔 FAVORİLERDEN ÇIKARMA
  const onRemoveFromFavorites = async (product: FavoriteProduct) => {
    try {
      await removeFromFavorites(product.id);
      setFavorites(prev => prev.filter(fav => fav.id !== product.id));
      Alert.alert("💔 Favoriler", `"${product.name}" favorilerden çıkarıldı.`);
    } catch (error) {
      console.error('[FavoritesTab] Favorilerden çıkarma hatası:', error);
      Alert.alert("❌ Hata", "Favorilerden çıkarılırken hata oluştu.");
    }
  };

  // 🛒 SEPETE EKLEME FONKSİYONU
  const onAdd = async (product: FavoriteProduct) => {
    if (!currentToken) { 
      Alert.alert(
        "🔐 Giriş Gerekli", 
        "Sepete ürün eklemek için giriş yapmanız gerekiyor."
      ); 
      return; 
    }
    
    try {
      await addToCart(currentToken, product.id, 1);
      Alert.alert("✅ Sepet", `"${product.name}" sepete eklendi!`);
    } catch (error) {
      console.error('[FavoritesTab] Sepete ekleme hatası:', error);
      Alert.alert("❌ Hata", "Ürün sepete eklenirken hata oluştu.");
    }
  };

  // 🧹 TÜM FAVORİLERİ TEMİZLE
  const onClearAllFavorites = () => {
    Alert.alert(
      "🗑️ Favorileri Temizle",
      "Tüm favorilerinizi silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Evet, Sil", 
          style: "destructive",
          onPress: async () => {
            try {
              await clearFavorites();
              setFavorites([]);
              Alert.alert("✅ Başarılı", "Tüm favoriler temizlendi.");
            } catch (error) {
              console.error('[FavoritesTab] Favorileri temizleme hatası:', error);
              Alert.alert("❌ Hata", "Favoriler temizlenirken hata oluştu.");
            }
          }
        }
      ]
    );
  };

  // 📄 BOŞ LİSTE KOMPONENTI
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color="#666" />
      <Text style={styles.emptyTitle}>Henüz favori ürününüz yok</Text>
      <Text style={styles.emptySubtitle}>
        Keşfet sayfasından beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* PAGE HEADER */}
      <PageHeader 
        title={`Favorilerim (${favorites.length})`}
        rightComponent={
          favorites.length > 0 ? (
            <Pressable style={styles.clearButton} onPress={onClearAllFavorites}>
              <Ionicons name="trash-outline" size={20} color="#C48913" />
            </Pressable>
          ) : null
        }
      />

      <View style={styles.content}>
        <FlatList
          data={favorites}
          keyExtractor={(x) => String(x.id)}
          numColumns={1}
          contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadFavorites} />}
          ListEmptyComponent={renderEmptyComponent}
          renderItem={({ item }) => (
            <ProductCard 
              item={item} 
              onAdd={onAdd} 
              onAddToFavorites={onRemoveFromFavorites}
              isFavorite={true}
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
  content: {
    flex: 1,
  },
  clearButton: {
    backgroundColor: 'rgba(196, 137, 19, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C48913',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
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