// components/ProductCard.tsx
import React, { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "../services/catalog";
import { imgUri } from "../api/http";
import { LinearGradient } from 'expo-linear-gradient';
import GoldText from "./GoldText";
import SilverText from "./SilverText";
import { useCart } from "../contexts/CartContext";

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

export default function ProductCard({
  item,
  onAdd,
  onAddToFavorites,
  isFavorite = false,
  showFavoriteButton = true,
  disabled = false,
}: { 
  item: Product; 
  onAdd?: (p: Product) => void;
  onAddToFavorites?: (p: Product) => void;
  isFavorite?: boolean;
  showFavoriteButton?: boolean;
  disabled?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const { updateCartCount } = useCart();
  const uri = imgUri(item.imagePath);

  const handleAddToCart = async (product: Product) => {
    if (onAdd) {
      await onAdd(product);
      // 🔄 Cart count'u güncelle
      setTimeout(() => updateCartCount(), 500); // API çağrısı tamamlandıktan sonra güncelle
    }
  };

  return (
    <View style={{ 
      borderWidth: 1, 
      borderColor: "#333", 
      borderRadius: 12, 
      padding: 12, 
      gap: 8, 
      backgroundColor: "#111", 
      position: "relative",
      flex: 1,
      minWidth: 160
    }}>
      {/* FAVORITE BUTTON */}
      {showFavoriteButton && onAddToFavorites && (
        <Pressable
          onPress={() => onAddToFavorites(item)}
          style={{ 
            position: "absolute", 
            top: 8, 
            right: 8, 
            zIndex: 1, 
            backgroundColor: "rgba(0,0,0,0.7)", 
            borderRadius: 20, 
            padding: 8 
          }}
        >
                     <Ionicons 
             name={isFavorite ? "heart" : "heart-outline"} 
             size={20} 
             color={isFavorite ? "#C48913" : "#fff"} 
           />
        </Pressable>
      )}

      {/* IMAGE */}
      {uri && !failed ? (
        <Image
          source={{ uri }}
          onError={() => setFailed(true)}
          style={{ height: 140, borderRadius: 10, backgroundColor: "#222" }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ height: 140, borderRadius: 10, backgroundColor: "#222", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#777", fontSize: 12 }}>Görsel yok</Text>
        </View>
      )}

      {/* TEXTS */}
      <SilverText style={styles.productName} numberOfLines={2}>
        {item.brandName} • {item.name}
      </SilverText>
      <GoldText style={styles.productPrice}>
        {formatPrice(item.price)} ₺
      </GoldText>

      {/* CTA */}
      {onAdd && (
        <Pressable
          onPress={disabled ? undefined : () => handleAddToCart(item)}
          disabled={disabled}
          style={({ pressed }) => [{ 
            marginTop: 6, 
            borderRadius: 8,
            overflow: 'hidden',
            opacity: disabled ? 0.6 : 1,
          }, pressed && !disabled && { opacity: 0.8 }]}
        >
          {disabled ? (
            <View style={{
              borderWidth: 1, 
              borderColor: "#555", 
              borderRadius: 8, 
              padding: 8, 
              alignItems: "center",
              backgroundColor: "#333",
            }}>
              <Text style={{ 
                color: "#999", 
                fontWeight: "600",
                fontSize: 12
              }}>
                Yükleniyor...
              </Text>
            </View>
          ) : (
            <LinearGradient
              colors={['#D4AF37', '#C48913', '#B8860B']}
              style={{
                padding: 8, 
                alignItems: "center",
                borderRadius: 8,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={{ 
                color: "#000000", 
                fontWeight: "600",
                fontSize: 12
              }}>
                Sepete Ekle
              </Text>
            </LinearGradient>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  productPrice: {
    flexDirection:'row',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    marginBottom: 2,
  },
  productName: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 12,
    lineHeight: 16
  }
})
