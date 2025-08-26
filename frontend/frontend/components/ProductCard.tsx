// components/ProductCard.tsx
import React, { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "../services/catalog";
import { imgUri } from "../api/http";

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
  const uri = imgUri(item.imagePath);

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
      <Text style={{ 
        color: "#fff", 
        fontWeight: "700", 
        fontSize: 12,
        lineHeight: 16
      }} numberOfLines={2}>
        {item.brandName} • {item.name}
      </Text>
      <Text style={{ 
        color: "#C48913", 
        fontWeight: "600",
        fontSize: 14
      }}>
        {item.price.toFixed(2)} ₺
      </Text>

      {/* CTA */}
      {onAdd && (
        <Pressable
          onPress={disabled ? undefined : () => onAdd(item)}
          disabled={disabled}
          style={({ pressed }) => [{ 
            marginTop: 6, 
            borderWidth: 1, 
            borderColor: disabled ? "#555" : "#C48913", 
            borderRadius: 8, 
            padding: 8, 
            alignItems: "center",
            backgroundColor: disabled ? "#333" : "transparent",
            opacity: disabled ? 0.6 : 1,
          }, pressed && !disabled && { opacity: 0.8 }]}
        >
          <Text style={{ 
            color: disabled ? "#999" : "#C48913", 
            fontWeight: "600",
            fontSize: 12
          }}>
            {disabled ? "Yükleniyor..." : "Sepete Ekle"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
