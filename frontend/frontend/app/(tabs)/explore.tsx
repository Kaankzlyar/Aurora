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
  Pressable,
  TextInput,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuroraHeader from '../../components/AuroraHeader';
import SilverText from '../../components/SilverText';
import { getProducts, Product } from '../../services/catalog';
import { addToCart } from '../../services/cart';
import { addToFavorites, removeFromFavorites, getFavorites } from '../../services/favorites';
import { imgUri } from '../../api/http';
import AuthDebugger from '../../components/AuthDebugger';
import NotificationAlert from '../../components/NotificationAlert';
import { useNotification } from '../../hooks/useNotification';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onFavoritePress: (product: Product) => void;
  isFavorite?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress, 
  onFavoritePress, 
  isFavorite = false 
}) => {
  const imageUrl = imgUri(product.imagePath) || 'https://via.placeholder.com/150';
  
  return (
    <Pressable style={styles.productCard} onPress={onPress}>
      {/* Ürün Resmi */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
          onError={(error) => {
            console.log(`[ProductCard] Image error for ${product.name}:`, error.nativeEvent.error);
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
        <Text style={styles.productPrice}>
          ₺{product.price?.toLocaleString('tr-TR')}
        </Text>
      </View>
    </Pressable>
  );
};

const ExploreScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Notification hook
  const { notification, showSuccess, showError, showInfo, hideNotification } = useNotification();

  // Unique brands and categories
  const brands = [...new Set(products.map(p => p.brandName))];
  const categories = [...new Set(products.map(p => p.categoryName))];

  // Filtered products - now includes search functionality
  const filteredProducts = products.filter(product => {
    const brandMatch = !selectedBrand || product.brandName === selectedBrand;
    const categoryMatch = !selectedCategory || product.categoryName === selectedCategory;
    
    // Search functionality - check if product name, brand, or category contains search query
    const searchMatch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return brandMatch && categoryMatch && searchMatch;
  });

  const fetchProducts = async () => {
    try {
      console.log('[ExploreScreen] Ürünler yükleniyor...');
      console.log('[ExploreScreen] BASE_URL kontrol için catalog service çağrılıyor...');
      const data = await getProducts();
      console.log('[ExploreScreen] Yüklenen ürünler:', data);
      console.log('[ExploreScreen] Ürün sayısı:', data?.length || 0);
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
    loadFavorites(); // Favorileri yükle
  }, []);

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
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons name="options-outline" size={24} color="#C0C0C0" />
            </TouchableOpacity>
          </View>
          
          {/* Filtreler */}
          {showFilters && (
            <View style={styles.filtersContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {/* Marka Filtreleri */}
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    !selectedBrand && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedBrand('')}
                >
                  <Text style={[
                    styles.filterChipText,
                    !selectedBrand && styles.filterChipTextActive
                  ]}>
                    Tüm Markalar
                  </Text>
                </TouchableOpacity>
                
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand}
                    style={[
                      styles.filterChip,
                      selectedBrand === brand && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedBrand === brand && styles.filterChipTextActive
                    ]}>
                      {brand}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                <View style={styles.filterSeparator} />
                
                {/* Kategori Filtreleri */}
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    !selectedCategory && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedCategory('')}
                >
                  <Text style={[
                    styles.filterChipText,
                    !selectedCategory && styles.filterChipTextActive
                  ]}>
                    Tüm Kategoriler
                  </Text>
                </TouchableOpacity>
                
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterChip,
                      selectedCategory === category && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedCategory === category && styles.filterChipTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
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
          {filteredProducts.length > 0 ? (
            <View style={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product)}
                  onFavoritePress={handleFavoritePress}
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
    minHeight: 80,
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
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 80, // Tab bar için ekstra boşluk
  },
});

export default ExploreScreen;