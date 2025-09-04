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
import { getSpecialTodayProducts, Product } from '../../services/catalog';
import { addToCart } from '../../services/cart';
import AuroraHeader from '../../components/AuroraHeader';
import SilverText from '../../components/SilverText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToFavorites, removeFromFavorites, getFavorites } from '../../services/favorites';
import { useNotification } from '@/hooks/useNotification';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import NotificationAlert from '../../components/NotificationAlert';
import { imgUri } from '../../api/http';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onFavoritePress: (product: Product) => void;
  isFavorite?: boolean;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress, 
  onFavoritePress, 
  isFavorite = false,
  onAddToCart 
}) => {
  const imageUrl = imgUri(product.imagePath) || 'https://via.placeholder.com/150';
  
  return (
    <View style={styles.productCard}>
      {/* Ürün Resmi */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
        
        {/* Discount Badge */}
        {product.isOnDiscount && product.discountPercentage && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discountPercentage}%</Text>
          </View>
        )}
        
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
        <View style={styles.productContent}>
          <Text style={styles.productBrand} numberOfLines={1}>
            {product.brandName}
          </Text>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          
          {/* Price Section with Discount */}
          <View style={styles.priceContainer}>
            {product.isOnDiscount && product.originalPrice ? (
              <>
                <Text style={styles.originalPrice}>
                  ₺{product.originalPrice.toLocaleString('en-US')}
                </Text>
                <SilverText style={styles.discountedPrice}>
                  ₺{product.price?.toLocaleString('en-US')}
                </SilverText>
              </>
            ) : (
              <SilverText style={styles.productPrice}>
                ${product.price?.toLocaleString('en-US')}
              </SilverText>
            )}
          </View>
        </View>
        
        {/* Sepete Ekle Butonu - Sabit pozisyon */}
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

export default function SpecialTodayScreen() {
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

  const handleAddToCart = useCallback(async (product: Product) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showError('Giriş Gerekli', 'Sepete ürün eklemek için giriş yapmalısınız');
        return;
      }

      await addToCart(token, product.id, 1); // Fix: Pass token first, then productId, then quantity
      showSuccess('Sepete Eklendi', `${product.name} sepete eklendi`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError('Hata', 'Ürün sepete eklenirken hata oluştu');
    }
  }, [showSuccess, showError]);

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const difference = endOfDay.getTime() - now.getTime();
    
    if (difference > 0) {
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds });
    } else {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
    }
  }, []);

  useEffect(() => {
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getSpecialTodayProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading special today products:', error);
      Alert.alert('Error', 'Failed to load special products');
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
      console.log('[SpecialTodayScreen] Favoriler yüklendi:', favoriteIds);
    } catch (error) {
      console.error('[SpecialTodayScreen] Favoriler yüklenirken hata:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, [loadProducts]);

  const handleProductPress = async (product: Product) => {
    const discountInfo = product.isOnDiscount && product.originalPrice 
      ? `\nOriginal Price: $${product.originalPrice.toLocaleString('en-US')}\nSPECIAL PRICE: $${product.price?.toLocaleString('en-US')} (${product.discountPercentage}% OFF!)` 
      : `\nPrice: $${product.price?.toLocaleString('en-US')}`;
      
    Alert.alert(
      `🎯 ${product.name}`, 
      `Brand: ${product.brandName}\nCategory: ${product.categoryName}${discountInfo}`,
      [
        { 
          text: 'Add to Cart', 
          onPress: async () => {
            try {
              console.log('[SpecialTodayScreen] Adding to cart:', product.name);
              const token = await AsyncStorage.getItem('userToken');
              if (!token) {
                showError('Login Required', 'You must be logged in to add items to cart.');
                return;
              }
              
              await addToCart(token, product.id, 1); // Fix: Pass token first
              console.log('[SpecialTodayScreen] ✅ Added to cart:', product.name);
              showSuccess('Success!', `${product.name} added to cart!`);
            } catch (error) {
              console.error('[SpecialTodayScreen] Add to cart error:', error);
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
        console.log('[SpecialTodayScreen] Favorilerden çıkarıldı:', product.name);
        showInfo('Removed from Favorites', `${product.name} removed from favorites.`);
      } else {
        // Favorilere ekle
        await addToFavorites(product);
        newFavorites.add(product.id);
        console.log('[SpecialTodayScreen] Favorilere eklendi:', product.name);
        showSuccess('Added to Favorites', `${product.name} added to favorites!`);
      }
      setFavorites(newFavorites);
    } catch (error) {
      console.error('[SpecialTodayScreen] Favori işlemi hatası:', error);
      showError('Error', 'An error occurred during the favorite operation.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AuroraHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4444" />
          <Text style={styles.loadingText}>Finding today's best deals...</Text>
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
      
      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section - Now inside ScrollView to hide on scroll */}
        <View style={bb.wrapper}>
                    {/* arka panel: bronz degrade */}
                    <LinearGradient
                      colors={["#8B4513", "#6B3410", "#4A2608"]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={bb.panel}
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
                      <View style={bb.content}>
                        {/* Countdown Timer */}
                        <View style={bb.timerContainer}>
                          <Text style={bb.timerLabel}>SPECIAL FOR TODAY</Text>
                          <View style={bb.timerRow}>
                            <View style={bb.timeUnit}>
                              <Text style={bb.timeNumber}>{timeLeft.hours.toString().padStart(2, '0')}</Text>
                              <Text style={bb.timeLabel}>H</Text>
                            </View>
                            <Text style={bb.timeSeparator}>:</Text>
                            <View style={bb.timeUnit}>
                              <Text style={bb.timeNumber}>{timeLeft.minutes.toString().padStart(2, '0')}</Text>
                              <Text style={bb.timeLabel}>M</Text>
                            </View>
                            <Text style={bb.timeSeparator}>:</Text>
                            <View style={bb.timeUnit}>
                              <Text style={bb.timeNumber}>{timeLeft.seconds.toString().padStart(2, '0')}</Text>
                              <Text style={bb.timeLabel}>S</Text>
                            </View>
                          </View>
                        </View>

                        {/* Main Title with Bronze Gradient */}
                        <View style={bb.titleContainer}>
                          <LinearGradient
                            colors={["#D2B48C", "#CD853F", "#A0522D"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={bb.titleGradient}
                          >
                            <Text style={bb.title}>Curated Icons</Text>
                            <Text style={bb.subtitle}>Today with Privilege</Text>
                          </LinearGradient>
                        </View>
                      </View>
                    </LinearGradient>
              
                    {/* ince gümüş çerçeve */}
                    <View pointerEvents="none" style={bb.stroke} />
                  </View>
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
              <Text style={styles.emptyText}>No special offers today</Text>
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

const bb = StyleSheet.create({
  wrapper: {
    borderRadius: 26,
    overflow: "hidden",
    marginTop: 5,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
    alignSelf: 'center',
    width: '92%',
    maxWidth: 720,
  },
  panel: {
    padding: 20,
    minHeight: 180,
    justifyContent: "center",
  },
  stroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(210, 180, 140, 0.5)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  timerLabel: {
    color: "#D2B48C",
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 4,
    fontFamily: "Montserrat_500Medium",
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeUnit: {
    alignItems: 'center',
    marginHorizontal: 6,
    minWidth: 35,
  },
  timeNumber: {
    color: "#F5DEB3",
    fontSize: 20,
    fontFamily: "PlayfairDisplay_700Bold",
    lineHeight: 24,
  },
  timeLabel: {
    color: "#D2B48C",
    fontSize: 9,
    letterSpacing: 1,
    fontFamily: "Montserrat_500Medium",
    marginTop: 1,
  },
  timeSeparator: {
    color: "#D2B48C",
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
    marginHorizontal: 2,
  },
  titleContainer: {
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 2,
  },
  titleGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
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
    fontSize: 18,
    marginBottom: 0,
    textAlign: 'center',
    fontFamily: "Cinzel_700Bold",
    color: "#62392aff",
    letterSpacing: 1,
  },
  subtitle:{
    color: "#635543ff",
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: "Cinzel_400Regular",
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
    // Buton için yer ayrıldı, margin kaldırıldı
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
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
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
    height: 170, // Increased for better spacing with discount prices
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  productContent: {
    flex: 1,
    justifyContent: 'flex-start',
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
  },
  productPrice: {
    color: '#C0C0C0',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Azaltıldı - daha iyi boşluk için
    gap: 8,
  },
  originalPrice: {
    color: '#888888',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    color: '#FF4444',
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
