import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import AuroraHeader from '../../components/AuroraHeader';
import SilverText from '../../components/SilverText';
import { getProducts, Product } from '../../services/catalog';
import { addToCart } from '../../services/cart';
import { addToFavorites, removeFromFavorites, getFavorites } from '../../services/favorites';
import { imgUri } from '../../api/http';
import AuthDebugger from '../../components/AuthDebugger';
import NotificationAlert from '../../components/NotificationAlert';
import { useNotification } from '../../hooks/useNotification';
import { BASE_URL } from '../../constants/config';
import FilterScreen, { FilterOptions } from '../../components/FilterScreen';
import OrderModal from '../../components/OrderModal';
import { LinearGradient } from 'expo-linear-gradient';

// Sayı formatlama fonksiyonu
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onFavoritePress: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isFavorite?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress, 
  onFavoritePress,
  onAddToCart,
  isFavorite = false 
}) => {
  const imageUrl = imgUri(product.imagePath) || 'https://via.placeholder.com/150';
  
  // Debug için console log
  console.log(`[ProductCard] ===== IMAGE DEBUG =====`);
  console.log(`[ProductCard] Product: ${product.name}`);
  console.log(`[ProductCard] Raw ImagePath: "${product.imagePath}"`);
  console.log(`[ProductCard] Final ImageURL: "${imageUrl}"`);
  console.log(`[ProductCard] ========================`);
  
  return (
    <View style={styles.productCard}>
      {/* Ürün Resmi */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
          onError={(error) => {
            console.log(`[ProductCard] ❌ Image error for ${product.name}:`, error.nativeEvent.error);
            console.log(`[ProductCard] ❌ Failed URL: ${imageUrl}`);
            console.log(`[ProductCard] ❌ Original ImagePath: ${product.imagePath}`);
          }}
          onLoad={() => {
            console.log(`[ProductCard] ✅ Image loaded successfully for ${product.name}: ${imageUrl}`);
          }}
        />
        
        {/* Favori Butonu - Sağ Üst Köşe */}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => onFavoritePress(product)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={20} 
            color={isFavorite ? "#C48913" : "#FFFFFF"} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Ürün Bilgileri */}
      <View style={styles.productInfo}>
        <Text style={styles.productBrand} numberOfLines={1}>
          {product.brandName}
        </Text>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <SilverText style={styles.productPrice}>
          ₺{formatPrice(product.price)}
        </SilverText>
        
        {/* Sepete Ekleme Butonu */}
        <TouchableOpacity
          style={styles.addToCartButtonContainer}
          onPress={() => onAddToCart(product)}
        >
          <LinearGradient
            colors={['#D4AF37', '#C48913', '#B8860B']}
            style={styles.addToCartButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="cart-outline" size={16} color="#000000" />
            <Text style={styles.addToCartText}>Sepete Ekle</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ExploreScreen = () => {
  // Get URL parameters
  const { preSelectedCategory } = useLocalSearchParams<{ preSelectedCategory?: string }>();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFilterScreen, setShowFilterScreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]); // Separate state for categories
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Filter options - initialize with preSelectedCategory if provided
  const [filters, setFilters] = useState<FilterOptions>({
    selectedBrand: '',
    selectedCategory: preSelectedCategory || '',
    selectedSize: '',
    selectedShoeNumber: '',
    selectedGender: '',
    priceRange: { min: 0, max: 1000000 },
    orderBy: 'newest',
    orderDirection: 'desc',
  });

  // Notification hook
  const { notification, showSuccess, showError, showInfo, hideNotification } = useNotification();

  // Unique brands from products
  const brands = [...new Set(products.map(p => p.brandName))];

  // Filtered and sorted products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = products.filter(product => {
      const brandMatch = !filters.selectedBrand || product.brandName === filters.selectedBrand;
      const categoryMatch = !filters.selectedCategory || product.categoryName === filters.selectedCategory;
      
      // Search functionality - check if product name, brand, or category contains search query
      const searchMatch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return brandMatch && categoryMatch && searchMatch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.orderBy) {
        case 'price':
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          return filters.orderDirection === 'asc' ? priceA - priceB : priceB - priceA;
        
        case 'alphabetical':
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          if (filters.orderDirection === 'asc') {
            return nameA.localeCompare(nameB);
          } else {
            return nameB.localeCompare(nameA);
          }
        
        case 'newest':
        default:
          // Assuming products have a createdAt field, fallback to ID for now
          const idA = a.id;
          const idB = b.id;
          return filters.orderDirection === 'asc' ? idA - idB : idB - idA;
      }
    });

    return filtered;
  }, [products, filters, searchQuery]);

  // Fetch categories from backend API
  const fetchCategories = async () => {
    try {
      console.log('[ExploreScreen] Kategoriler API\'den yükleniyor...');
      // Use the same base URL as other API calls in the app
      const response = await fetch(`${BASE_URL}/api/categories`);
      if (response.ok) {
        const categoriesData = await response.json();
        const categoryNames = categoriesData.map((cat: any) => cat.name);
        setCategories(categoryNames);
        console.log('[ExploreScreen] ✅ Kategoriler yüklendi:', categoryNames);
        console.log('[ExploreScreen] Kategori sayısı:', categoryNames.length);
      } else {
        console.error('[ExploreScreen] ❌ Kategoriler API hatası:', response.status);
      }
    } catch (error) {
      console.error('[ExploreScreen] ❌ Kategoriler yüklenirken hata:', error);
      // Fallback to categories from products if API fails
      const fallbackCategories = [...new Set(products.map(p => p.categoryName))];
      setCategories(fallbackCategories);
      console.log('[ExploreScreen] 🔄 Fallback kategoriler kullanıldı:', fallbackCategories);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('[ExploreScreen] Ürünler yükleniyor...');
      console.log('[ExploreScreen] BASE_URL kontrol için catalog service çağrılıyor...');
      const data = await getProducts();
      console.log('[ExploreScreen] Yüklenen ürünler:', data);
      console.log('[ExploreScreen] Ürün sayısı:', data?.length || 0);
      
      // Her ürünün imagePath'ini kontrol et
      if (data && data.length > 0) {
        data.forEach((product, index) => {
          console.log(`[ExploreScreen] Ürün ${index + 1}: ${product.name}`);
          console.log(`[ExploreScreen] ImagePath: ${product.imagePath}`);
          console.log(`[ExploreScreen] Oluşturulan URL: ${imgUri(product.imagePath)}`);
        });
      }
      
      setProducts(data || []);
    } catch (error) {
      console.error('[ExploreScreen] Network error:', error);
      console.error('[ExploreScreen] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      Alert.alert('Hata', `Ürünler yüklenirken bir hata oluştu:\n\nDetay: ${error.message}\n\nLütfen backend'in çalıştığından emin olun.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories(); // Fetch categories from backend
    loadFavorites(); // Favorileri yükle
  }, []);

  // Handle preSelectedCategory parameter changes
  useEffect(() => {
    if (preSelectedCategory) {
      console.log('[ExploreScreen] Pre-selected category from URL:', preSelectedCategory);
      setFilters(prev => ({
        ...prev,
        selectedCategory: preSelectedCategory
      }));
    }
  }, [preSelectedCategory]);

  // Load favorites from storage on component mount
  const loadFavorites = async () => {
    try {
      // Favorileri servisten al (backend veya local)
      const favoriteProducts = await getFavorites();
      const favoriteIds = favoriteProducts.map(fav => fav.id);
      setFavorites(new Set(favoriteIds));
      console.log('[ExploreScreen] Favoriler yüklendi:', favoriteIds);
    } catch (error) {
      console.error('[ExploreScreen] Favoriler yüklenirken hata:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
    fetchCategories(); // Also refresh categories
  };

  const handleAddToCart = async (product: Product) => {
    try {
      console.log('[ExploreScreen] Sepete ekleniyor:', product.name);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showError('Giriş Gerekli', 'Sepete eklemek için giriş yapmalısınız.');
        return;
      }
      
      await addToCart(token, product.id, 1);
      console.log('[ExploreScreen] ✅ Sepete eklendi:', product.name);
      showSuccess('Başarılı!', `${product.name} sepete eklendi!`);
    } catch (error) {
      console.error('[ExploreScreen] Sepete ekleme hatası:', error);
      showError('Hata', 'Ürün sepete eklenirken bir hata oluştu.');
    }
  };

  const handleProductPress = async (product: Product) => {
    Alert.alert(
      product.name, 
      `Marka: ${product.brandName}\nKategori: ${product.categoryName}\nFiyat: ₺${product.price?.toLocaleString('tr-TR')}`,
      [
        { 
          text: 'Sepete Ekle', 
          onPress: async () => {
            try {
              console.log('[ExploreScreen] Sepete ekleniyor:', product.name);
              const token = await AsyncStorage.getItem('userToken');
              if (!token) {
                showError('Giriş Gerekli', 'Sepete eklemek için giriş yapmalısınız.');
                return;
              }
              
              await addToCart(token, product.id, 1);
              console.log('[ExploreScreen] ✅ Sepete eklendi:', product.name);
              showSuccess('Başarılı!', `${product.name} sepete eklendi!`);
            } catch (error) {
              console.error('[ExploreScreen] Sepete ekleme hatası:', error);
              showError('Hata', 'Ürün sepete eklenirken bir hata oluştu.');
            }
          }
        },
        { text: 'İptal', style: 'cancel' }
      ]
    );
  };

  const handleFavoritePress = async (product: Product) => {
    try {
      const newFavorites = new Set(favorites);
      if (favorites.has(product.id)) {
        // Favorilerden çıkar
        await removeFromFavorites(product.id);
        newFavorites.delete(product.id);
        console.log('[ExploreScreen] Favorilerden çıkarıldı:', product.name);
        showInfo('Favorilerden Çıkarıldı', `${product.name} favorilerden çıkarıldı.`);
      } else {
        // Favorilere ekle
        await addToFavorites(product);
        newFavorites.add(product.id);
        console.log('[ExploreScreen] Favorilere eklendi:', product.name);
        showSuccess('Favorilere Eklendi', `${product.name} favorilere eklendi!`);
      }
      setFavorites(newFavorites);
    } catch (error) {
      console.error('[ExploreScreen] Favori işlemi hatası:', error);
      showError('Hata', 'Favori işlemi sırasında bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AuroraHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C0C0C0" />
          <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Notification Alert */}
      <NotificationAlert
        type={notification.type}
        title={notification.title}
        message={notification.message}
        visible={notification.visible}
        onClose={hideNotification}
        autoHide={true}
        duration={4000}
      />
      
      {/* Filter Screen */}
      <FilterScreen
        visible={showFilterScreen}
        onClose={() => setShowFilterScreen(false)}
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
          setShowFilterScreen(false);
        }}
        currentFilters={filters}
      />
      
      {/* Order Modal */}
      <OrderModal
        visible={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onApplyOrder={(orderBy, direction) => {
          setFilters(prev => ({ ...prev, orderBy, orderDirection: direction }));
          setShowOrderModal(false);
        }}
        currentOrderBy={filters.orderBy}
        currentDirection={filters.orderDirection}
      />
      
      {/* AuroraHeader - same as other pages */}
      <AuroraHeader />
      
      {/* Search Bar Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#C0C0C0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ürün, marka veya kategori ara..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#C0C0C0" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Debug Component - Temporary */}
      
      
      {/* Başlık ve Filtre Kısmı */}
      <View style={styles.titleAndFilterSection}>
          <View style={styles.titleRow}>
            <SilverText style={styles.pageTitle}>Keşfet</SilverText>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.orderButton}
               onPress={() => {
                  console.log('[ExploreScreen] Order button pressed, setting showOrderModal to true');
                  setShowOrderModal(true);
                }}
              >
                <Ionicons name="swap-vertical" size={24} color="#C0C0C0" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.filterButton,
                  (filters.selectedBrand || filters.selectedCategory || filters.selectedSize || filters.selectedShoeNumber || filters.selectedGender) && styles.filterButtonActive
                ]}
                onPress={() => setShowFilterScreen(true)}
              >
                <Ionicons name="options-outline" size={24} color="#C0C0C0" />
                {(filters.selectedBrand || filters.selectedCategory || filters.selectedSize || filters.selectedShoeNumber || filters.selectedGender) && (
                  <View style={styles.filterIndicator} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Filtreler */}
          {/* The FilterScreen component is now rendered above the header */}
        </View>
      
      {/* İçerik */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Ürünler Grid */}
        <View style={styles.productsContainer}>
          {filteredAndSortedProducts.length > 0 ? (
            <View style={styles.productsGrid}>
              {filteredAndSortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product)}
                  onFavoritePress={handleFavoritePress}
                  onAddToCart={handleAddToCart}
                  isFavorite={favorites.has(product.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="bag-outline" size={64} color="#666666" />
              <Text style={styles.emptyText}>
                {products.length === 0 
                  ? 'Henüz ürün bulunmuyor.' 
                  : searchQuery 
                    ? `"${searchQuery}" için sonuç bulunamadı.`
                    : 'Bu filtreler için ürün bulunamadı.'
                }
              </Text>
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <Text style={styles.refreshButtonText}>Yenile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Alt boşluk - tab bar için */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Tab bar için daha fazla boşluk
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#C0C0C0',
    marginTop: 10,
    fontSize: 16,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#000000', // Changed from '#1A1A1A' to match page background
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000', // Changed from '#0B0B0B' to pure black
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#C0C0C0', // Changed from '#333333' to silver
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 8,
  },
  titleAndFilterSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left', // Sol tarafa yasla
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
  },
  filterButtonActive: {
    backgroundColor: '#C0C0C0',
    borderColor: '#C0C0C0',
  },
  filterIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#C48913',
    borderRadius: 10,
    width: 10,
    height: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10, // Button spacing
  },
  orderButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
  },
  filtersContainer: {
    paddingVertical: 10,
  },
  filterChip: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333333',
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
  filterSeparator: {
    width: 1,
    height: 30,
    backgroundColor: '#333333',
    marginHorizontal: 12,
    alignSelf: 'center',
  },
  productsContainer: {
    paddingHorizontal: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2A2A2A',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
    minHeight: 100,
  },
  productBrand: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
    flex: 1,
  },
  productPrice: {
    color: '#C0C0C0',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.1,
    marginBottom: 8,
  },
  addToCartButtonContainer: {
    marginTop: 4,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#666666',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#C0C0C0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#C48913',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 80, // Tab bar için ekstra boşluk
  },
});

export default ExploreScreen;