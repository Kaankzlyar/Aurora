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
import { BASE_URL } from "../../constants/config";

export default function FavoritesTab() {
  const { isAuthenticated, getCurrentToken } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Notification hook
  const { notification, showSuccess, showError, showWarning, showInfo, hideNotification } = useNotification();

  // Update debug info when authentication state changes
  useEffect(() => {
    const updateDebugInfo = async () => {
      try {
        const token = await getCurrentToken();
        setDebugInfo(`🔍 Debug: isAuthenticated=${isAuthenticated ? '✅' : '❌'}, Token=${token ? '✅' : '❌'}, Loading=${loading ? '⏳' : '✅'}`);
      } catch (error) {
        setDebugInfo(`🔍 Debug: isAuthenticated=${isAuthenticated ? '✅' : '❌'}, Token=❌, Loading=${loading ? '⏳' : '✅'}`);
      }
    };
    
    if (__DEV__) {
      updateDebugInfo();
    }
  }, [isAuthenticated, loading, getCurrentToken]);

  // Test token function for debugging
  const testToken = async () => {
    try {
      console.log('[FavoritesTab] ===== TESTING TOKEN =====');
      const token = await getCurrentToken();
      
      if (!token) {
        console.log('[FavoritesTab] ❌ No token available');
        showError('Test Sonucu', 'Token bulunamadı');
        return;
      }
      
      console.log('[FavoritesTab] ✅ Token found, analyzing...');
      console.log('[FavoritesTab] Token length:', token.length);
      console.log('[FavoritesTab] Token starts with:', token.substring(0, 10));
      console.log('[FavoritesTab] Token ends with:', token.substring(token.length - 10));
      console.log('[FavoritesTab] Token contains spaces:', token.includes(' '));
      console.log('[FavoritesTab] Token contains newlines:', token.includes('\n'));
      
      // Check if token looks like a JWT (should have 3 parts separated by dots)
      const tokenParts = token.split('.');
      console.log('[FavoritesTab] Token parts count:', tokenParts.length);
      if (tokenParts.length === 3) {
        console.log('[FavoritesTab] ✅ Token format looks like JWT');
        try {
          // Try to decode the payload (second part)
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('[FavoritesTab] Token payload:', payload);
          if (payload.exp) {
            const expirationDate = new Date(payload.exp * 1000);
            const now = new Date();
            const isExpired = expirationDate < now;
            console.log('[FavoritesTab] Token expiration:', expirationDate.toISOString());
            console.log('[FavoritesTab] Current time:', now.toISOString());
            console.log('[FavoritesTab] Token expired:', isExpired);
            
            if (isExpired) {
              showWarning('Token Süresi Dolmuş', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
              return;
            }
          }
        } catch (decodeError) {
          console.log('[FavoritesTab] ❌ Could not decode token payload:', decodeError);
        }
      } else {
        console.log('[FavoritesTab] ❌ Token format does not look like JWT');
      }
      
      console.log('[FavoritesTab] Testing with API...');
      
      // Test the token by making a simple API call
      const response = await fetch(`${BASE_URL}/api/cart`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('[FavoritesTab] API Response Status:', response.status);
      console.log('[FavoritesTab] API Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('[FavoritesTab] ✅ Token is valid! API response:', data);
        showSuccess('Test Sonucu', 'Token geçerli! API bağlantısı başarılı.');
      } else {
        const errorText = await response.text();
        console.log('[FavoritesTab] ❌ Token validation failed:', errorText);
        showError('Test Sonucu', `Token hatası: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('[FavoritesTab] ❌ Token test error:', error);
      showError('Test Hatası', 'Token test edilirken hata oluştu: ' + error?.message);
    }
    
    console.log('[FavoritesTab] ===== TOKEN TEST END =====');
  };

  // Check token expiration before making API calls
  const checkTokenExpiration = async (token: string): Promise<boolean> => {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          const isExpired = payload.exp < currentTime;
          
          if (isExpired) {
            console.log('[FavoritesTab] ❌ Token expired, redirecting to login');
            showWarning('Oturum Süresi Dolmuş', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
            // You could redirect to login here if needed
            return false;
          }
          
          console.log('[FavoritesTab] ✅ Token is valid, expires in', payload.exp - currentTime, 'seconds');
          return true;
        }
      }
      return true; // If we can't decode, assume it's valid
    } catch (error) {
      console.error('[FavoritesTab] Error checking token expiration:', error);
      return true; // If we can't check, assume it's valid
    }
  };

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
    /* console.log('[FavoritesTab] ===== ADD TO CART REQUEST =====');
    console.log('[FavoritesTab] Product:', product.name, '(ID:', product.id, ')');
    console.log('[FavoritesTab] isAuthenticated:', isAuthenticated);
     */
    try {
      console.log('[FavoritesTab] Getting current token...');
      const currentToken = await getCurrentToken();
      console.log('[FavoritesTab] Token retrieved:', currentToken ? `✅ ${currentToken.substring(0, 20)}...` : '❌ NULL');
      
      if (!currentToken) { 
        console.log('[FavoritesTab] ❌ No token available, showing login warning');
        showWarning('Giriş Gerekli', 'Sepete ürün eklemek için giriş yapmanız gerekiyor.'); 
        return; 
      }
      
      // Check if token is expired
      const isTokenValid = await checkTokenExpiration(currentToken);
      if (!isTokenValid) {
        console.log('[FavoritesTab] ❌ Token is expired, cannot proceed');
        return;
      }
      
    /*   console.log('[FavoritesTab] ✅ Token available and valid, calling addToCart...');
      console.log('[FavoritesTab] Token preview:', currentToken.substring(0, 50) + '...');
      console.log('[FavoritesTab] Product ID:', product.id);
      console.log('[FavoritesTab] Quantity: 1'); */
      
      await addToCart(currentToken, product.id, 1);
      console.log('[FavoritesTab] ✅ addToCart successful!');
      showSuccess('Sepete Eklendi', `"${product.name}" sepete eklendi!`);
    } catch (error) {
      console.error('[FavoritesTab] ❌ addToCart failed:', error);
      console.error('[FavoritesTab] Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      
      // Check if it's an authentication error
      if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
        showError('Kimlik Doğrulama Hatası', 'Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.');
      } else if (error?.message?.includes('403') || error?.message?.includes('Forbidden')) {
        showError('Yetki Hatası', 'Bu işlem için yetkiniz bulunmamaktadır.');
      } else {
        showError('Hata', 'Ürün sepete eklenirken hata oluştu: ' + (error?.message || 'Bilinmeyen hata'));
      }
    }
    
    console.log('[FavoritesTab] ===== ADD TO CART REQUEST END =====');
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
          <View style={styles.titleRightSection}>
            {/* Token loading indicator removed as per new_code */}
            {favorites.length > 0 && (
              <Pressable style={styles.clearButton} onPress={onClearAllFavorites}>
                <Ionicons name="trash-outline" size={20} color="#C48913" />
                <Text style={styles.clearButtonText}>Temizle</Text>
              </Pressable>
            )}
          </View>
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
              disabled={false} // Token loading is handled by AuthContext
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
  titleRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  debugSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  debugText: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
  },
  testButton: {
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
  testButtonText: {
    color: '#C48913',
    fontSize: 12,
    paddingBottom: 2,
    fontFamily: 'Montserrat_500Medium',
  },
});