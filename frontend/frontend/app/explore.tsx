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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuroraHeader from '../components/AuroraHeader';
import SilverText from '../components/SilverText';
import { getProducts, Product } from '../services/catalog';
import { imgUri } from '../api/http';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const imageUrl = imgUri(product.imagePath) || 'https://via.placeholder.com/150';

  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productPrice}>
          ₺{product.price?.toLocaleString('tr-TR')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const ExploreScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleProductPress = (product: Product) => {
    Alert.alert('Ürün Detayı', `${product.name} seçildi.`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AuroraHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C0C0C0" />
          <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AuroraHeader />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Başlık */}
        <View style={styles.titleSection}>
          <SilverText style={styles.pageTitle}>Keşfet</SilverText>
        </View>

        {/* Ürünler Grid */}
        <View style={styles.productsContainer}>
          {products.length > 0 ? (
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz ürün bulunmuyor.</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <Text style={styles.refreshButtonText}>Yenile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingVertical: 20,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#2A2A2A',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    lineHeight: 18,
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
    paddingVertical: 50,
  },
  emptyText: {
    color: '#666666',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#C0C0C0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExploreScreen;
