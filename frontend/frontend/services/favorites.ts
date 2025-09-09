// services/favorites.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from './catalog';
import { validateStoredToken, clearInvalidToken } from '../utils/tokenValidator';
import { BASE_URL as CONFIG_BASE } from '../constants/config';
import { router } from 'expo-router';

// Merkezî backend URL'ini kullan
const API_BASE_URL = `${CONFIG_BASE}/api`;
const FAVORITES_KEY = 'userFavorites';

export interface FavoriteProduct extends Product {
  dateAdded?: string;
}

/**
 * Token'ı yenile (eğer mümkünse)
 */
const refreshTokenIfNeeded = async (): Promise<string | null> => {
  try {
    console.log('🔄 [FavoritesService] Token yenileme kontrol ediliyor...');
    
    // Mevcut token'ı kontrol et
    const currentToken = await AsyncStorage.getItem('userToken');
    if (!currentToken) {
      console.log('⚠️ [FavoritesService] Mevcut token bulunamadı');
      return null;
    }
    
    // Token'ın geçerliliğini kontrol et
    const validation = await validateStoredToken();
    
    if (validation.isValid && !validation.isExpired) {
      console.log('✅ [FavoritesService] Mevcut token geçerli, yenileme gerekmez');
      return currentToken;
    }
    
    if (validation.isExpired) {
      console.log('⏰ [FavoritesService] Token expired, yenileme gerekli');
      // Burada token refresh logic eklenebilir
      // Şimdilik expired token'ı temizle
      await clearInvalidToken();
      return null;
    }
    
    return null;
  } catch (error) {
    console.error('🚨 [FavoritesService] Token yenileme hatası:', error);
    return null;
  }
};

/**
 * Token'ı AsyncStorage'dan al ve doğrula
 */
const getToken = async (): Promise<string | null> => {
  try {
    console.log('🔑 [FavoritesService] Token validation başlatılıyor...');
    
    // Önce token yenileme kontrol et
    const refreshedToken = await refreshTokenIfNeeded();
    if (refreshedToken) {
      console.log('✅ [FavoritesService] Refreshed token kullanılıyor');
      return refreshedToken;
    }
    
    const validation = await validateStoredToken();
    console.log('🔑 [FavoritesService] Token validation sonucu:', {
      isValid: validation.isValid,
      isExpired: validation.isExpired,
      hasToken: validation.hasToken,
      shouldRedirectToLogin: validation.shouldRedirectToLogin,
      timeUntilExpiry: validation.timeUntilExpiry
    });
    
    if (validation.shouldRedirectToLogin) {
      console.log('🚨 [FavoritesService] Token expired/invalid - redirecting to login');
      await clearInvalidToken();
      
      try {
        router.replace('/(auth)/login');
      } catch (routerError) {
        console.log('🚨 [FavoritesService] Router not available for redirect');
      }
      
      return null;
    }
    
    if (validation.isValid && validation.hasToken) {
      const token = await AsyncStorage.getItem('userToken');
      console.log('🔑 [FavoritesService] Valid token alındı, uzunluk:', token?.length || 0);
      return token;
    }
    
    console.log('⚠️ [FavoritesService] Token validation başarısız');
    return null;
  } catch (error) {
    console.error('🚨 [FavoritesService] Token alma hatası:', error);
    return null;
  }
};

/**
 * Favorilere ürün ekle (Backend API)
 */
export const addToFavorites = async (product: Product): Promise<void> => {
  try {
    const token = await getToken();
    
    if (!token) {
      // Token yoksa local storage'a ekle (offline mode)
      return addToFavoritesLocal(product);
    }

    const response = await fetch(`${API_BASE_URL}/user/favorites/${product.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log('Ürün favorilere eklendi (Backend):', product.name);
  } catch (error) {
    console.error('Backend favorilere ekleme hatası:', error);
    // Backend hatası durumunda local storage'a fallback
    return addToFavoritesLocal(product);
  }
};

/**
 * Local favorilere ürün ekle (Fallback)
 */
const addToFavoritesLocal = async (product: Product): Promise<void> => {
  try {
    const favorites = await getFavoritesLocal();
    const isAlreadyFavorite = favorites.some(fav => fav.id === product.id);
    
    if (!isAlreadyFavorite) {
      const favoriteProduct: FavoriteProduct = {
        ...product,
        dateAdded: new Date().toISOString(),
      };
      
      const updatedFavorites = [...favorites, favoriteProduct];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    }
  } catch (error) {
    console.error('Local favorilere ekleme hatası:', error);
    throw error;
  }
};

/**
 * Favorilerden ürün çıkar (Backend API)
 */
export const removeFromFavorites = async (productId: number): Promise<void> => {
  try {
    const token = await getToken();
    
    if (!token) {
      // Token yoksa local storage'dan çıkar
      return removeFromFavoritesLocal(productId);
    }

    const response = await fetch(`${API_BASE_URL}/user/favorites/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log('Ürün favorilerden çıkarıldı (Backend):', productId);
  } catch (error) {
    console.error('Backend favorilerden çıkarma hatası:', error);
    // Backend hatası durumunda local storage'dan çıkar
    return removeFromFavoritesLocal(productId);
  }
};

/**
 * Local favorilerden ürün çıkar (Fallback)
 */
const removeFromFavoritesLocal = async (productId: number): Promise<void> => {
  try {
    const favorites = await getFavoritesLocal();
    const updatedFavorites = favorites.filter(fav => fav.id !== productId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Local favorilerden çıkarma hatası:', error);
    throw error;
  }
};

/**
 * Tüm favorileri getir (Backend API)
 */
export const getFavorites = async (): Promise<FavoriteProduct[]> => {
  try {
    console.log('❤️ [FavoritesService] Favoriler getiriliyor...');
    
    const token = await getToken();
    
    if (!token) {
      console.log('⚠️ [FavoritesService] Token bulunamadı, local storage\'dan getiriliyor');
      // Token yoksa local storage'dan getir
      return getFavoritesLocal();
    }

    console.log('🌐 [FavoritesService] Backend API\'ye istek gönderiliyor...');
    console.log('🌐 [FavoritesService] URL:', `${API_BASE_URL}/user/favorites`);
    console.log('🌐 [FavoritesService] Token uzunluğu:', token.length);
    console.log('🌐 [FavoritesService] Authorization header:', `Bearer ${token.substring(0, 20)}...`);

    const response = await fetch(`${API_BASE_URL}/user/favorites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🌐 [FavoritesService] Response status:', response.status, response.statusText);
    console.log('🌐 [FavoritesService] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🚨 [FavoritesService] Backend error response:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      
      if (response.status === 401) {
        console.error('🚨 [FavoritesService] 401 Unauthorized - Token geçersiz veya expired');
        // 401 hatası durumunda token'ı temizle ve local storage'a fallback
        await clearInvalidToken();
        console.log('🧹 [FavoritesService] Invalid token temizlendi, local storage\'a fallback');
      }
      
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const favorites = await response.json();
    console.log('✅ [FavoritesService] Favoriler backend\'den geldi:', favorites.length);
    return favorites;
  } catch (error) {
    console.error('🚨 [FavoritesService] Backend favoriler getirme hatası:', error);
    console.error('🚨 [FavoritesService] Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Backend hatası durumunda local storage'dan getir
    console.log('🔄 [FavoritesService] Local storage\'a fallback yapılıyor...');
    return getFavoritesLocal();
  }
};

/**
 * Local favorileri getir (Fallback)
 */
const getFavoritesLocal = async (): Promise<FavoriteProduct[]> => {
  try {
    const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  } catch (error) {
    console.error('Local favoriler getirme hatası:', error);
    return [];
  }
};

/**
 * Backend bağlantısını test et
 */
export const testBackendConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🧪 [FavoritesService] Backend bağlantısı test ediliyor...');
    
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      return { success: false, message: 'Token bulunamadı' };
    }
    
    console.log('🧪 [FavoritesService] Test token uzunluğu:', token.length);
    
    const response = await fetch(`${API_BASE_URL}/user/favorites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🧪 [FavoritesService] Test response:', response.status, response.statusText);
    
    if (response.ok) {
      return { success: true, message: 'Backend bağlantısı başarılı' };
    } else if (response.status === 401) {
      return { success: false, message: 'Token geçersiz (401 Unauthorized)' };
    } else {
      const errorText = await response.text();
      return { success: false, message: `HTTP ${response.status}: ${errorText}` };
    }
  } catch (error) {
    console.error('🧪 [FavoritesService] Test hatası:', error);
    return { success: false, message: `Bağlantı hatası: ${error.message}` };
  }
};

/**
 * Ürünün favori olup olmadığını kontrol et
 */
export const isFavorite = async (productId: number): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.some(fav => fav.id === productId);
  } catch (error) {
    console.error('Favori kontrol hatası:', error);
    return false;
  }
};

/**
 * Favorileri temizle (Backend API)
 */
export const clearFavorites = async (): Promise<void> => {
  try {
    const token = await getToken();
    
    if (!token) {
      // Token yoksa local storage'ı temizle
      return clearFavoritesLocal();
    }

    const response = await fetch(`${API_BASE_URL}/user/favorites`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log('Tüm favoriler temizlendi (Backend)');
  } catch (error) {
    console.error('Backend favorileri temizleme hatası:', error);
    // Backend hatası durumunda local storage'ı temizle
    return clearFavoritesLocal();
  }
};

/**
 * Local favorileri temizle (Fallback)
 */
const clearFavoritesLocal = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error('Local favorileri temizleme hatası:', error);
    throw error;
  }
};
