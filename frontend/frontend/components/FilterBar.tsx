import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Brand, Category, getBrands, getCategories } from "../services/catalog";

export default function FilterBar({
  value, onChange
}: {
  value: { brandId?: number; categoryId?: number };
  onChange: (v: { brandId?: number; categoryId?: number }) => void;
}) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  useEffect(() => { getBrands().then(setBrands); getCategories().then(setCats); }, []);

  const Pill = ({ label, active, onPress }:{label:string; active:boolean; onPress:()=>void}) => (
    <Pressable onPress={onPress}
      style={{ paddingHorizontal:12, paddingVertical:6, borderRadius:16, marginRight:8,
               borderWidth:1, backgroundColor: active? "#111":"#fff" }}>
      <Text style={{ color: active? "#fff":"#111" }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ gap:8 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical:4 }}>
        <Pill label="Tümü" active={!value.brandId}
              onPress={() => onChange({ ...value, brandId: undefined })} />
        {brands.map(b => (
          <Pill key={b.id} label={b.name} active={value.brandId===b.id}
                onPress={() => onChange({ ...value, brandId: b.id })} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Pill label="Hepsi" active={!value.categoryId}
              onPress={() => onChange({ ...value, categoryId: undefined })} />
        {cats.map(c => (
          <Pill key={c.id} label={c.name} active={value.categoryId===c.id}
                onPress={() => onChange({ ...value, categoryId: c.id })} />
        ))}
      </ScrollView>
    </View>
  );
}
