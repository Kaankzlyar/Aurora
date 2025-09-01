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
            color={favorites.has(product.id) ? "#FF4B6E" : "#FFFFFF"}
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
          ${product.price}
        </Text>
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
          <View style={styles.titleSection}>
            <SilverText style={styles.pageTitle}>Iconic Selections</SilverText>
            <SilverText style={styles.subtitle}>Curated luxury pieces for discerning taste</SilverText>
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
