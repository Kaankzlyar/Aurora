import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Alert,
  Image,
  TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import { getNewArrivals, Product } from '../../services/catalog';
import { addToCart } from '../../services/cart';
import AuroraHeader from '../../components/AuroraHeader';
import SilverText from '../../components/SilverText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToFavorites, removeFromFavorites, getFavorites } from '../../services/favorites';
import { useNotification } from '@/hooks/useNotification';
import { Ionicons } from '@expo/vector-icons';
import NotificationAlert from '../../components/NotificationAlert';
import { imgUri } from '../../api/http';
import { LinearGradient } from 'expo-linear-gradient';
import GoldText from '@/components/GoldText';

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
  
  return (
    <Pressable style={styles.productCard} onPress={onPress}>
      {/* Ürün Resmi */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
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
          ₺{product.price?.toLocaleString('en-US')}
        </SilverText>

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
    </Pressable>
  );
};

export default function NewArrivalsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    notification, 
    showSuccess, 
    showError, 
    showInfo, 
    hideNotification } = useNotification();
  

  const loadProducts = useCallback(async () => {
    try {
      const data = await getNewArrivals();
      setProducts(data);
    } catch (error) {
      console.error('Error loading new arrivals:', error);
      Alert.alert('Error', 'Failed to load new arrivals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadFavorites();
  }, [loadProducts]);

  const loadFavorites = async () => {
    try {
      // Favorileri servisten al (backend veya local)
      const favoriteProducts = await getFavorites();
      const favoriteIds = favoriteProducts.map(fav => fav.id);
      setFavorites(new Set(favoriteIds));
      console.log('[NewArrivalsScreen] Favoriler yüklendi:', favoriteIds);
    } catch (error) {
      console.error('[NewArrivalsScreen] Favoriler yüklenirken hata:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, [loadProducts]);

  

  const handleProductPress = async (product: Product) => {
    Alert.alert(
      product.name, 
      `Brand: ${product.brandName}\nCategory: ${product.categoryName}\nPrice: $${product.price?.toLocaleString('en-US')}`,
      [
        { 
          text: 'Add to Cart', 
          onPress: async () => {
            try {
              console.log('[NewArrivalsScreen] Adding to cart:', product.name);
              const token = await AsyncStorage.getItem('userToken');
              if (!token) {
                showError('Login Required', 'You must be logged in to add items to cart.');
                return;
              }
              
              await addToCart(product.id.toString(), 1);
              console.log('[NewArrivalsScreen] ✅ Added to cart:', product.name);
              showSuccess('Success!', `${product.name} added to cart!`);
            } catch (error) {
              console.error('[NewArrivalsScreen] Add to cart error:', error);
              showError('Error', 'An error occurred while adding the product to cart.');
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
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
        console.log('[NewArrivalsScreen] Favorilerden çıkarıldı:', product.name);
        showInfo('Removed from Favorites', `${product.name} removed from favorites.`);
      } else {
        // Favorilere ekle
        await addToFavorites(product);
        newFavorites.add(product.id);
        console.log('[NewArrivalsScreen] Favorilere eklendi:', product.name);
        showSuccess('Added to Favorites', `${product.name} added to favorites!`);
      }
      setFavorites(newFavorites);
    } catch (error) {
      console.error('[NewArrivalsScreen] Favori işlemi hatası:', error);
      showError('Error', 'An error occurred during the favorite operation.');
    }
  };

  const handleAddToCart = useCallback(async (product: Product) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showError('Giriş Gerekli', 'Sepete ürün eklemek için giriş yapmalısınız');
        return;
      }

      await addToCart(product.id.toString(), 1);
      showSuccess('Sepete Eklendi', `${product.name} sepete eklendi`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError('Hata', 'Ürün sepete eklenirken hata oluştu');
    }
  }, [showSuccess, showError]);

  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      key={item.id}
      product={item}
      onPress={() => handleProductPress(item)}
      onFavoritePress={handleFavoritePress}
      onAddToCart={handleAddToCart}
      isFavorite={favorites.has(item.id)}
    />
  ), [favorites, handleFavoritePress, handleAddToCart]);

  if (loading) {
    return (
      <View style={styles.container}>
        <AuroraHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C0C0C0" />
          <Text style={styles.loadingText}>Loading new arrivals...</Text>
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
      
      {/* Title Section */}
      <View style={styles.headerSection}>
        <View style={ib.wrapper}>
          {/* arka panel: altın degrade */}
          <LinearGradient
            colors={["#C48913", "#8d680bff", "#553921ff"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={ib.panel}
          >
            {/* hafif ışık vurgusu */}
            <View style={StyleSheet.absoluteFill}>
              <LinearGradient
                colors={["rgba(255,255,255,0.10)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.35, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
            {/* sağ üstten diyagonal karartma */}
            <View style={StyleSheet.absoluteFill}>
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.20)"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>

            {/* içerik */}
            <View style={ib.textCol}>
              <Text style={[ib.title,]}>New Arrivals</Text>
            </View>
          </LinearGradient>

          {/* ince altın çerçeve */}
          <View pointerEvents="none" style={ib.stroke} />
        </View>
      </View>
      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Products Grid */}
        <View style={styles.productsContainer}>
          {products.length > 0 ? (
            <View style={styles.productsGrid}>
              {products.map((product) => (
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
              <Text style={styles.emptyText}>No new arrivals found</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Bottom spacer - for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const ib = StyleSheet.create({
  wrapper: {
    borderRadius: 22,
    overflow: "hidden",
    marginTop: 5,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 720,
  },
  panel: {
    padding: 16,
    minHeight: 80,
    justifyContent: "center",
  },
  stroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(212, 175, 55, 0.45)", // gold stroke
  },
  textCol: { maxWidth: "80%" },
  overline: {
    color: "#C9CDD3",
    letterSpacing: 2,
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 8,
    fontFamily: "Montserrat_500Medium",
  },
  title: {
    fontSize: 26,
    marginBottom: 4,
    padding: 0,
    textAlign: 'center',
    justifyContent: 'center',
    marginLeft: -48,
    fontFamily: "Cinzel_700Bold", // Match GoldText font
  },
  desc: {
    color: "#D0D3D8",
    fontSize: 13,
    marginBottom: 14,
    fontFamily: "CormorantGaramond_400Regular",
  },
  cta: { alignSelf: "flex-start", borderRadius: 10, overflow: "hidden" },
  ctaBg: { paddingVertical: 10, paddingHorizontal: 16 },
  ctaPressed: { transform: [{ scale: 0.98 }], opacity: 0.96 },
  ctaText: {
    color: "#0F1114",
    letterSpacing: 1,
    fontSize: 12,
    fontFamily: "Montserrat_500Medium",
    width: '100%',
  },
});


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
  headerSection: {
    paddingHorizontal: 16,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond_400Regular',
    textAlign: 'center',
    opacity: 0.8,
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
    letterSpacing: 0.1,
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
