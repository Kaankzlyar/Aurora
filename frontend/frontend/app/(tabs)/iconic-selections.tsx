import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  ScrollView,
  Image,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { getIconicSelections, Product } from '../../services/catalog';
import { addToCart } from '../../services/cart';
import AuroraHeader from '../../components/AuroraHeader';
import SilverText from '../../components/SilverText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToFavorites, removeFromFavorites, getFavorites } from '../../services/favorites';
import { useNotification } from '@/hooks/useNotification';
import { Ionicons } from '@expo/vector-icons';
import NotificationAlert from '../../components/NotificationAlert';
import { imgUri } from '../../api/http';

// Sayı formatlama fonksiyonu
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

export default function IconicSelectionsScreen() {
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

  const loadFavorites = useCallback(async () => {
    try {
      const favs = await getFavorites();
      setFavorites(new Set(favs.map(fav => fav.id)));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getIconicSelections();
      setProducts(data);
    } catch (error) {
      console.error('Error loading iconic selections:', error);
      showError('Hata', 'Ürünler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadProducts();
    loadFavorites();
  }, [loadProducts, loadFavorites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadProducts(), loadFavorites()]);
    setRefreshing(false);
  }, [loadProducts, loadFavorites]);

  const handleToggleFavorite = useCallback(async (product: Product) => {
    try {
      if (favorites.has(product.id)) {
        await removeFromFavorites(product.id);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(product.id);
          return newSet;
        });
        showInfo('Favoriler', 'Favorilerden kaldırıldı');
      } else {
        await addToFavorites(product);
        setFavorites(prev => new Set(prev).add(product.id));
        showSuccess('Favoriler', 'Favorilere eklendi');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showError('Hata', 'Favoriler güncellenirken hata oluştu');
    }
  }, [favorites, showSuccess, showError, showInfo]);

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

  const ProductCard = ({ product }: { product: Product }) => (
    <Pressable 
      style={styles.productCard}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: imgUri(product.imagePath) }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(product)}
        >
          <Ionicons
            name={favorites.has(product.id) ? "heart" : "heart-outline"}
            size={20}
            color={favorites.has(product.id) ? "#C48913" : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productBrand} numberOfLines={1}>
          {product.brandName}
        </Text>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productPrice}>
          ₺{formatPrice(product.price)}
        </Text>
        
        {/* Sepete Ekleme Butonu */}
        <TouchableOpacity
          style={styles.addToCartButtonContainer}
          onPress={() => handleAddToCart(product)}
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


  return (
    <View style={styles.container}>
      <NotificationAlert 
        type={notification.type}
        title={notification.title}
        message={notification.message}
        visible={notification.visible}
        onClose={hideNotification} 
      />
      
      <View style={styles.content}>
        <AuroraHeader />
        
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#C0C0C0"
            />
          }
        >
          <View style={ib.wrapper}>
            {/* arka panel: soğuk gri degrade */}
            <LinearGradient
              colors={["#3C3F44", "#2C2F33", "#1C1F22"]}
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
                <SilverText style={ib.title}>Iconic Selections</SilverText>
              </View>
            </LinearGradient>
      
            {/* ince gümüş çerçeve */}
            <View pointerEvents="none" style={ib.stroke} />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#C0C0C0" />
              <Text style={styles.loadingText}>Loading iconic selections...</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={64} color="#666666" />
              <Text style={styles.emptyText}>No iconic selections found</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.productsContainer}>
              <View style={styles.productsGrid}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </View>
            </View>
          )}
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
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
    width: '92%',
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
    borderColor: "rgba(192, 197, 206, 0.45)", // silver stroke
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
    fontSize: 22,
    marginBottom: 6,
    alignContent: 'center',
    justifyContent: 'center',
    fontFamily: "Cinzel_700Bold",
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
  // Premium Header Styles
  premiumHeader: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  headerContent: {
    padding: 8,
    alignItems: 'center',
  },
  iconicBadge: {
    marginBottom: 16,
    borderRadius: 25,
    padding: 2,
  },
  badgeGradient: {
    width: 25,
    height: 30,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  titleGradient: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  premiumTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  premiumSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#E8E8E8',
    textAlign: 'center',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  premiumDescription: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
  },
  decorativeLine: {
    width: '80%',
    height: 2,
    marginTop: 8,
  },
  lineGradient: {
    flex: 1,
    height: '100%',
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
    fontFamily: 'PlayfairDisplay_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond_400Regular',
    textAlign: 'center',
    opacity: 0.8,
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
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 80, // Tab bar için ekstra boşluk
  },
});
