/**
 * 🛒 CART CONTEXT - SEPET DURUMU YÖNETİMİ
 * 
 * Bu context, tüm uygulama genelinde sepet durumunu yönetir.
 * Badge gösterimi için sepetteki toplam ürün sayısını takip eder.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCart } from '../services/cart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItemCount: number;
  updateCartCount: () => Promise<void>;
  resetCartCount: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const { isAuthenticated } = useAuth();

  // 🔄 Sepet sayısını güncelle
  const updateCartCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token || !isAuthenticated) {
        setCartItemCount(0);
        return;
      }

      const cartData = await getCart(token);
      setCartItemCount(cartData.totalQuantity || 0);
    } catch (error) {
      console.error('[CartContext] Sepet sayısı alınamadı:', error);
      setCartItemCount(0);
    }
  };

  // 🚫 Sepet sayısını sıfırla
  const resetCartCount = () => {
    setCartItemCount(0);
  };

  // 🔄 Authentication durumu değiştiğinde sepet sayısını güncelle
  useEffect(() => {
    if (isAuthenticated) {
      updateCartCount();
    } else {
      resetCartCount();
    }
  }, [isAuthenticated]);

  const value: CartContextType = {
    cartItemCount,
    updateCartCount,
    resetCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
