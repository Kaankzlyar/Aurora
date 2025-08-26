import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getMyOrders, Order } from '../services/orders';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OrdersScreen() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Hata', 'Oturum bilgisi bulunamadı.');
        return;
      }

      const ordersData = await getMyOrders(token);
      setOrders(ordersData);
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
      Alert.alert('Hata', 'Siparişler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return { text: 'Beklemede', color: '#FFA500' };
      case 1: return { text: 'Ödendi', color: '#4CAF50' };
      case 2: return { text: 'Hazırlanıyor', color: '#2196F3' };
      case 3: return { text: 'Kargoda', color: '#9C27B0' };
      case 4: return { text: 'Teslim Edildi', color: '#4CAF50' };
      case 5: return { text: 'İptal Edildi', color: '#F44336' };
      default: return { text: 'Bilinmiyor', color: '#999' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </Pressable>
          <Text style={styles.title}>Siparişlerim</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>Giriş yapmanız gerekiyor.</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </Pressable>
          <Text style={styles.title}>Siparişlerim</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Siparişler yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </Pressable>
        <Text style={styles.title}>Siparişlerim</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📦</Text>
            <Text style={styles.emptyStateTitle}>Henüz Sipariş Yok</Text>
            <Text style={styles.emptyStateText}>
              İlk siparişinizi vermek için ürünleri keşfedin ve sepete ekleyin.
            </Text>
                         <Pressable 
               style={styles.emptyStateButton}
               onPress={() => router.push('/(tabs)/index')}
             >
              <Text style={styles.emptyStateButtonText}>Alışverişe Başla</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {orders.map((order) => {
              const status = getStatusText(order.status);
              return (
                <View key={order.id} style={styles.orderCard}>
                  {/* Order Header */}
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderNumber}>Sipariş #{order.id}</Text>
                      <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                      <Text style={styles.statusText}>{status.text}</Text>
                    </View>
                  </View>

                  {/* Order Items */}
                  <View style={styles.orderItems}>
                    {order.items.map((item, index) => (
                      <View key={index} style={styles.orderItem}>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName}>{item.productName}</Text>
                          <Text style={styles.itemDetails}>
                            {item.quantity} adet × {item.unitPrice.toFixed(2)} ₺
                          </Text>
                        </View>
                        <Text style={styles.itemTotal}>{item.lineTotal.toFixed(2)} ₺</Text>
                      </View>
                    ))}
                  </View>

                  {/* Order Summary */}
                  <View style={styles.orderSummary}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Ara Toplam:</Text>
                      <Text style={styles.summaryValue}>{order.subtotal.toFixed(2)} ₺</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Kargo:</Text>
                      <Text style={styles.summaryValue}>{order.shippingFee.toFixed(2)} ₺</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Toplam:</Text>
                      <Text style={styles.totalValue}>{order.grandTotal.toFixed(2)} ₺</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyStateButtonText: {
    color: '#0B0B0B',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  ordersContainer: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 4,
  },
  orderDate: {
    color: '#CCCCCC',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 2,
  },
  itemDetails: {
    color: '#CCCCCC',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  itemTotal: {
    color: '#D4AF37',
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    color: '#D4AF37',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  totalValue: {
    color: '#D4AF37',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
    marginTop: 100,
  },
});
