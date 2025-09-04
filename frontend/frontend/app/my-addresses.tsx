import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getMyAddresses, deleteAddress, Address } from '../services/addresses';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AuroraHeader from '../components/AuroraHeader';
import SilverText from '../components/SilverText';
import { useNotification } from '../hooks/useNotification';
import NotificationAlert from '../components/NotificationAlert';
import ConfirmationDialog from '../components/ConfirmationDialog';

export default function MyAddressesScreen() {
  const { isAuthenticated } = useAuth();
  const { notification, showError, showSuccess, showWarning, hideNotification } = useNotification();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<{id: number, title: string} | null>(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setCurrentToken(token);
        console.log('[MyAddresses] Token checked:', token ? 'FOUND' : 'NOT_FOUND');
        
        if (token) {
          await loadAddresses();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('[MyAddresses] Error checking token:', error);
        setLoading(false);
      }
    };
    checkAuthAndLoad();
  }, []);

  const loadAddresses = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showError('Hata', 'Oturum bilgisi bulunamadı.');
        return;
      }

      const data = await getMyAddresses(token);
      setAddresses(data);
    } catch (error) {
      console.error('Adresler yüklenirken hata:', error);
      showError('Hata', 'Adresler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  };

  const handleDeleteAddress = async (addressId: number, addressTitle: string) => {
    setSelectedAddress({ id: addressId, title: addressTitle });
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteAddress = async () => {
    if (!selectedAddress || !currentToken) return;
    
    try {
      setDeletingId(selectedAddress.id);
      await deleteAddress(currentToken, selectedAddress.id);
      
      // Remove from local state
      setAddresses(prev => prev.filter(addr => addr.id !== selectedAddress.id));
      showSuccess('Başarılı!', 'Adres başarıyla silindi.');
    } catch (error) {
      console.error('Adres silinirken hata:', error);
      showError('Hata', 'Adres silinirken hata oluştu.');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirmation(false);
      setSelectedAddress(null);
    }
  };

  const cancelDeleteAddress = () => {
    setShowDeleteConfirmation(false);
    setSelectedAddress(null);
  };

  if (!isAuthenticated && !currentToken && !loading) {
    return (
      <View style={styles.container}>
        <AuroraHeader />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Ionicons name="arrow-back" size={24} color="#D4AF37" />
            </View>
          </Pressable>
          <SilverText style={styles.title}>Adreslerim</SilverText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>🔐 Giriş Gerekli</Text>
            <Text style={styles.errorSubtext}>Adreslerinizi görmek için giriş yapmanız gerekiyor.</Text>
            <Pressable 
              style={styles.loginButton} 
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.loginButtonText}>🔑 Giriş Yap</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <AuroraHeader />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Ionicons name="arrow-back" size={24} color="#D4AF37" />
            </View>
          </Pressable>
          <SilverText style={styles.title}>Adreslerim</SilverText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NotificationAlert
        type={notification.type}
        title={notification.title}
        message={notification.message}
        visible={notification.visible}
        onClose={hideNotification}
        autoHide={true}
        duration={4000}
      />
      
      <AuroraHeader />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </View>
        </Pressable>
        <SilverText style={styles.title}>Adreslerim</SilverText>
        <Pressable 
          onPress={() => router.push('/add-address')} 
          style={styles.addButton}
        >
          <Ionicons name="add" size={20} color="#D4AF37" />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Kayıtlı adreslerinizi görüntüleyebilir, düzenleyebilir veya silebilirsiniz.
        </Text>

        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#666666" />
            <Text style={styles.emptyTitle}>Henüz adres eklenmemiş</Text>
            <Text style={styles.emptySubtitle}>
              İlk adresinizi ekleyerek hızlı teslimat için kaydedin.
            </Text>
            <Pressable 
              style={styles.addFirstButton}
              onPress={() => router.push('/add-address')}
            >
              <LinearGradient
                colors={['#D4AF37', '#C48913', '#B8860B']}
                style={styles.addFirstButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.addFirstButtonContent}>
                  <Ionicons name="add-outline" size={20} color="#0B0B0B" />
                  <Text style={styles.addFirstButtonText}>İlk Adresini Ekle</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <View style={styles.addressesContainer}>
            {addresses.map((address) => (
              <View key={address.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressTitleContainer}>
                    <Ionicons name="location" size={20} color="#D4AF37" />
                    <Text style={styles.addressTitle}>{address.title}</Text>
                  </View>
                  <View style={styles.addressActions}>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => router.push({
                        pathname: '/edit-address',
                        params: { id: address.id }
                      })}
                    >
                      <Ionicons name="create-outline" size={20} color="#D4AF37" />
                    </Pressable>
                    <Pressable
                      style={[styles.actionButton, deletingId === address.id && styles.actionButtonDisabled]}
                      onPress={() => handleDeleteAddress(address.id, address.title)}
                      disabled={deletingId === address.id}
                    >
                      {deletingId === address.id ? (
                        <ActivityIndicator size="small" color="#FF6B6B" />
                      ) : (
                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                      )}
                    </Pressable>
                  </View>
                </View>

                <View style={styles.addressContent}>
                  <Text style={styles.addressText}>
                    {address.street} {address.buildingNo}
                    {address.apartmentNo && ` / ${address.apartmentNo}`}
                  </Text>
                  <Text style={styles.addressText}>
                    {address.neighborhood}, {address.district}
                  </Text>
                  <Text style={styles.addressText}>
                    {address.city}, {address.country}
                  </Text>
                  {address.postalCode && (
                    <Text style={styles.addressText}>
                      Posta Kodu: {address.postalCode}
                    </Text>
                  )}
                  {address.line2 && (
                    <Text style={styles.addressText}>
                      {address.line2}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        visible={showDeleteConfirmation}
        title="Adresi Sil"
        message={selectedAddress ? `"${selectedAddress.title}" adresini silmek istediğinizden emin misiniz?` : ''}
        confirmText="Evet, Sil"
        cancelText="İptal"
        onConfirm={confirmDeleteAddress}
        onCancel={cancelDeleteAddress}
        type="danger"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 15,
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
    marginTop: 8,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign:'center',
    justifyContent : 'center',
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  description: {
    color: '#CCCCCC',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#CCCCCC',
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#888888',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  addFirstButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  addFirstButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addFirstButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressesContainer: {
    gap: 16,
  },
  addressCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 8,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  addressContent: {
    gap: 4,
  },
  addressText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
    marginTop: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorSubtext: {
    color: '#CCCCCC',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  bottomSpacer: {
    height: 80,
  },
});
