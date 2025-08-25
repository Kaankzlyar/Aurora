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
import { FlatList, View, RefreshControl, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFavorites, removeFromFavorites, clearFavorites, FavoriteProduct } from "../../services/favorites";
import ProductCard from "../../components/ProductCard";
import { addToCart } from "../../services/cart";
import { useAuth } from "../../contexts/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuroraHeader from "../../components/AuroraHeader";
import { useFocusEffect } from "@react-navigation/native";
import SilverText from "../../components/SilverText";
import NotificationAlert from "../../components/NotificationAlert";
import { useNotification } from "../../hooks/useNotification";
import ConfirmationDialog from "../../components/ConfirmationDialog";

export default function FavoritesTab() {
  const { isAuthenticated } = useAuth();
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Notification hook
  const { notification, showSuccess, showError, showWarning, showInfo, hideNotification } = useNotification();

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
      console.log('[FavoritesTab] Favoriler yüklendi, sayı:', favs.length);
    } catch (error) {
      console.error('[FavoritesTab] Favoriler yüklenemedi:', error);
      showError('Hata', 'Favoriler yüklenirken hata oluştu.');
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
      console.log('[FavoritesTab] Favorilerden çıkarıldı:', product.name);
      showError('Favorilerden Çıkarıldı', `"${product.name}" favorilerden çıkarıldı.`);
    } catch (error) {
      console.error('[FavoritesTab] Favorilerden çıkarma hatası:', error);
      showError('Hata', 'Favorilerden çıkarılırken hata oluştu.');
    }
  };

  // 🛒 SEPETE EKLEME FONKSİYONU
  const onAdd = async (product: FavoriteProduct) => {
    if (!currentToken) { 
      showWarning('Giriş Gerekli', 'Sepete ürün eklemek için giriş yapmanız gerekiyor.'); 
      return; 
    }
    
    try {
      await addToCart(currentToken, product.id, 1);
      showSuccess('Sepete Eklendi', `"${product.name}" sepete eklendi!`);
    } catch (error) {
      console.error('[FavoritesTab] Sepete ekleme hatası:', error);
      showError('Hata', 'Ürün sepete eklenirken hata oluştu.');
    }
  };

  // 🧹 TÜM FAVORİLERİ TEMİZLE
  const onClearAllFavorites = () => {
    setShowClearConfirmation(true);
  };

  const handleConfirmClearFavorites = async () => {
    try {
      await clearFavorites();
      setFavorites([]);
      showSuccess('Başarılı', 'Tüm favoriler temizlendi.');
    } catch (error) {
      console.error('[FavoritesTab] Favorileri temizleme hatası:', error);
      showError('Hata', 'Favoriler temizlenirken hata oluştu.');
    } finally {
      setShowClearConfirmation(false);
    }
  };

  const handleCancelClearFavorites = () => {
    setShowClearConfirmation(false);
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
      {/* Notification Alert */}
      <NotificationAlert
        type={notification.type}
        title={notification.title}
        message={notification.message}
        visible={notification.visible}
        onClose={hideNotification}
        autoHide={true}
        duration={4000}
      />
      
      {/* AURORA HEADER */}
      <AuroraHeader />

      {/* PAGE CONTENT */}
      <View style={styles.pageContent}>
        {/* Favoriler Başlığı */}
        <View style={styles.titleSection}>
          <SilverText style={styles.pageTitle}>Favorilerim ({favorites.length})</SilverText>
          {favorites.length > 0 && (
            <Pressable style={styles.clearButton} onPress={onClearAllFavorites}>
              <Ionicons name="trash-outline" size={20} color="#C48913" />
              <Text style={styles.clearButtonText}>Temizle</Text>
            </Pressable>
          )}
        </View>

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

      {/* CONFIRMATION DIALOG */}
      <ConfirmationDialog
        visible={showClearConfirmation}
        title="Favorileri Temizle"
        message="Tüm favorilerinizi silmek istediğinizden emin misiniz?"
        confirmText="Evet, Sil"
        cancelText="İptal"
        onConfirm={handleConfirmClearFavorites}
        onCancel={handleCancelClearFavorites}
        type="danger"
      />
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(196, 137, 19, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C48913',
  },
  clearButtonText: {
    color: '#C48913',
    fontSize: 12,
    paddingBottom: 2,
    fontFamily: 'Montserrat_500Medium',
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