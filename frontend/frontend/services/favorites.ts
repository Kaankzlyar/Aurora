// services/favorites.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from './catalog';
import { validateStoredToken, clearInvalidToken } from '../utils/tokenValidator';
import { router } from 'expo-router';

// Mevcut backend URL'ini kullan
const API_BASE_URL = 'http://192.168.1.142:5270/api';
const FAVORITES_KEY = 'userFavorites';

export interface FavoriteProduct extends Product {
  dateAdded?: string;
}

/**
 * Token'ı AsyncStorage'dan al ve doğrula
 */
const getToken = async (): Promise<string | null> => {
  try {
    const validation = await validateStoredToken();
    
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
      return await AsyncStorage.getItem('userToken');
    }
    
    return null;
  } catch (error) {
    console.error('Token alma hatası:', error);
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
    const token = await getToken();
    
    if (!token) {
      // Token yoksa local storage'dan getir
      return getFavoritesLocal();
    }

    const response = await fetch(`${API_BASE_URL}/user/favorites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const favorites = await response.json();
    console.log('Favoriler backend\'den geldi:', favorites.length);
    return favorites;
  } catch (error) {
    console.error('Backend favoriler getirme hatası:', error);
    // Backend hatası durumunda local storage'dan getir
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
