/**
 * 🛒 CART TAB ICON WITH BADGE
 * 
 * Sepet tab iconu ve badge bileşeni.
 * Sepetteki ürün sayısını badge olarak gösterir.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';

interface CartTabIconProps {
  color: string;
  size?: number;
}

export default function CartTabIcon({ color, size = 22 }: CartTabIconProps) {
  const { cartItemCount } = useCart();

  return (
    <View style={styles.container}>
      <Ionicons name="bag-outline" size={size} color={color} />
      {cartItemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {cartItemCount > 99 ? '99+' : cartItemCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0B0B0B',
  },
  badgeText: {
    color: '#0B0B0B',
    fontSize: 10,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
    lineHeight: 12,
  },
});
