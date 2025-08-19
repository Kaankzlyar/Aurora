// components/ProductCard.tsx
import React, { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Product } from "../services/catalog";
import { imgUri } from "../api/http";

export default function ProductCard({
  item,
  onAdd,
}: { item: Product; onAdd?: (p: Product) => void }) {
  const [failed, setFailed] = useState(false);
  const uri = imgUri(item.imagePath);

  return (
    <View style={{ borderWidth: 1, borderColor: "#333", borderRadius: 12, padding: 12, gap: 8, backgroundColor: "#111" }}>
      {/* IMAGE */}
      {uri && !failed ? (
        <Image
          source={{ uri }}
          onError={() => setFailed(true)}
          style={{ height: 180, borderRadius: 10, backgroundColor: "#222" }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ height: 180, borderRadius: 10, backgroundColor: "#222", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#777" }}>Görsel yok</Text>
        </View>
      )}

      {/* TEXTS */}
      <Text style={{ color: "#fff", fontWeight: "700" }}>
        {item.brandName} • {item.name}
      </Text>
      <Text style={{ color: "#C48913", fontWeight: "600" }}>{item.price.toFixed(2)} ₺</Text>

      {/* CTA */}
      {onAdd && (
        <Pressable
          onPress={() => onAdd(item)}
          style={{ marginTop: 6, borderWidth: 1, borderColor: "#C48913", borderRadius: 10, padding: 10, alignItems: "center" }}
        >
          <Text style={{ color: "#C48913", fontWeight: "600" }}>Sepete Ekle</Text>
        </Pressable>
      )}
    </View>
  );
}
