/**
 * 🔍 FILTER MODAL - MODERN FİLTRE MODAL'I
 * 
 * Kullanıcıların marka ve kategori seçebildiği modal dialog
 */

import React, { useEffect, useState } from "react";
import { Modal, View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Brand, Category, getBrands, getCategories } from "../services/catalog";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  value: { brandId?: number; categoryId?: number };
  onChange: (v: { brandId?: number; categoryId?: number }) => void;
}

export default function FilterModal({ visible, onClose, value, onChange }: FilterModalProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tempFilter, setTempFilter] = useState(value);

  useEffect(() => {
    getBrands().then(setBrands);
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setTempFilter(value);
  }, [value]);

  const handleApply = () => {
    onChange(tempFilter);
    onClose();
  };

  const handleClear = () => {
    setTempFilter({});
    onChange({});
    onClose();
  };

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {children}
      </ScrollView>
    </View>
  );

  const FilterPill = ({ 
    label, 
    active, 
    onPress 
  }: { 
    label: string; 
    active: boolean; 
    onPress: () => void; 
  }) => (
    <Pressable 
      onPress={onPress}
      style={[
        styles.pill,
        active ? styles.pillActive : styles.pillInactive
      ]}
    >
      <Text style={[
        styles.pillText,
        active ? styles.pillTextActive : styles.pillTextInactive
      ]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Filtrele</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* CONTENT */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* MARKALAR */}
          <FilterSection title="Markalar">
            <FilterPill
              label="Tüm Markalar"
              active={!tempFilter.brandId}
              onPress={() => setTempFilter(prev => ({ ...prev, brandId: undefined }))}
            />
            {brands.map(brand => (
              <FilterPill
                key={brand.id}
                label={brand.name}
                active={tempFilter.brandId === brand.id}
                onPress={() => setTempFilter(prev => ({ ...prev, brandId: brand.id }))}
              />
            ))}
          </FilterSection>

          {/* KATEGORİLER */}
          <FilterSection title="Kategoriler">
            <FilterPill
              label="Tüm Kategoriler"
              active={!tempFilter.categoryId}
              onPress={() => setTempFilter(prev => ({ ...prev, categoryId: undefined }))}
            />
            {categories.map(category => (
              <FilterPill
                key={category.id}
                label={category.name}
                active={tempFilter.categoryId === category.id}
                onPress={() => setTempFilter(prev => ({ ...prev, categoryId: category.id }))}
              />
            ))}
          </FilterSection>
        </ScrollView>

        {/* FOOTER BUTTONS */}
        <View style={styles.footer}>
          <Pressable onPress={handleClear} style={[styles.button, styles.clearButton]}>
            <Text style={styles.clearButtonText}>Temizle</Text>
          </Pressable>
          
          <Pressable onPress={handleApply} style={[styles.button, styles.applyButton]}>
            <Text style={styles.applyButtonText}>Uygula</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#fff',
    marginBottom: 12,
  },
  scrollContent: {
    paddingRight: 20,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: '#C48913',
    borderColor: '#C48913',
  },
  pillInactive: {
    backgroundColor: 'transparent',
    borderColor: '#333',
  },
  pillText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  pillTextActive: {
    color: '#0B0B0B',
  },
  pillTextInactive: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  applyButton: {
    backgroundColor: '#C48913',
  },
  applyButtonText: {
    color: '#0B0B0B',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
