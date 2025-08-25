import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../constants/config';

interface FilterScreenProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  selectedBrand: string;
  selectedCategory: string;
  selectedSize: string;
  selectedShoeNumber: string;
  priceRange: {
    min: number;
    max: number;
  };
  orderBy: 'price' | 'alphabetical' | 'newest';
  orderDirection: 'asc' | 'desc';
}

const FilterScreen: React.FC<FilterScreenProps> = ({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
  const [shoeNumbers, setShoeNumbers] = useState<string[]>(['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']);

  // Fetch brands and categories from API
  useEffect(() => {
    if (visible) {
      fetchBrands();
      fetchCategories();
    }
  }, [visible]);

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/brands`);
      if (response.ok) {
        const brandsData = await response.json();
        const brandNames = brandsData.map((brand: any) => brand.name);
        setBrands(brandNames);
      }
    } catch (error) {
      console.error('[FilterScreen] Brands fetch error:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/categories`);
      if (response.ok) {
        const categoriesData = await response.json();
        const categoryNames = categoriesData.map((cat: any) => cat.name);
        setCategories(categoryNames);
      }
    } catch (error) {
      console.error('[FilterScreen] Categories fetch error:', error);
    }
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      selectedBrand: '',
      selectedCategory: '',
      selectedSize: '',
      selectedShoeNumber: '',
      priceRange: { min: 0, max: 10000 },
      orderBy: 'newest',
      orderDirection: 'desc',
    };
    setFilters(resetFilters);
  };

  const renderFilterSection = (title: string, children: React.ReactNode) => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderChip = (
    label: string,
    isSelected: boolean,
    onPress: () => void,
    type: 'brand' | 'category' | 'size' | 'shoe' = 'brand'
  ) => (
    <TouchableOpacity
      key={label}
      style={[
        styles.filterChip,
        isSelected && styles.filterChipActive,
        type === 'size' && styles.sizeChip,
        type === 'shoe' && styles.shoeChip,
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterChipText,
        isSelected && styles.filterChipTextActive,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#C0C0C0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filtreler</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Sıfırla</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Brands Section */}
          {renderFilterSection('Markalar', (
            <View style={styles.chipsContainer}>
              {renderChip('Tüm Markalar', !filters.selectedBrand, () => updateFilter('selectedBrand', ''))}
              {brands.map(brand => 
                renderChip(brand, filters.selectedBrand === brand, () => updateFilter('selectedBrand', brand))
              )}
            </View>
          ))}

          {/* Categories Section */}
          {renderFilterSection('Kategoriler', (
            <View style={styles.chipsContainer}>
              {renderChip('Tüm Kategoriler', !filters.selectedCategory, () => updateFilter('selectedCategory', ''), 'category')}
              {categories.map(category => 
                renderChip(category, filters.selectedCategory === category, () => updateFilter('selectedCategory', category), 'category')
              )}
            </View>
          ))}

          {/* Sizes Section */}
          {renderFilterSection('Bedenler', (
            <View style={styles.chipsContainer}>
              {renderChip('Tüm Bedenler', !filters.selectedSize, () => updateFilter('selectedSize', ''), 'size')}
              {sizes.map(size => 
                renderChip(size, filters.selectedSize === size, () => updateFilter('selectedSize', size), 'size')
              )}
            </View>
          ))}

          {/* Shoe Numbers Section */}
          {renderFilterSection('Ayakkabı Numaraları', (
            <View style={styles.chipsContainer}>
              {renderChip('Tüm Numaralar', !filters.selectedShoeNumber, () => updateFilter('selectedShoeNumber', ''), 'shoe')}
              {shoeNumbers.map(number => 
                renderChip(number, filters.selectedShoeNumber === number, () => updateFilter('selectedShoeNumber', number), 'shoe')
              )}
            </View>
          ))}

          {/* Price Range Section */}
          {renderFilterSection('Fiyat Aralığı', (
            <View style={styles.priceSection}>
              <Text style={styles.priceText}>
                ₺{filters.priceRange.min} - ₺{filters.priceRange.max}
              </Text>
              <Text style={styles.priceNote}>
                Fiyat aralığı özelliği yakında eklenecek
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Filtreleri Uygula</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resetButton: {
    padding: 8,
  },
  resetButtonText: {
    color: '#C48913',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: '#C0C0C0',
    borderColor: '#C0C0C0',
  },
  filterChipText: {
    color: '#C0C0C0',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  sizeChip: {
    minWidth: 50,
    alignItems: 'center',
  },
  shoeChip: {
    minWidth: 60,
    alignItems: 'center',
  },
  priceSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C0C0C0',
    marginBottom: 8,
  },
  priceNote: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  applyButton: {
    backgroundColor: '#C48913',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterScreen;
