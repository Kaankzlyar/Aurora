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
import { getMyCards, deleteCard, Card } from '../services/cards';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AuroraHeader from '../components/AuroraHeader';
import SilverText from '../components/SilverText';
import { useNotification } from '../hooks/useNotification';
import NotificationAlert from '../components/NotificationAlert';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { GoldenButton } from '../components/GoldenButton';

export default function MyCardsScreen() {
  const { isAuthenticated } = useAuth();
  const { notification, showError, showSuccess, showWarning, hideNotification } = useNotification();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{id: number, title: string} | null>(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setCurrentToken(token);
        console.log('[MyCards] Token checked:', token ? 'FOUND' : 'NOT_FOUND');
        
        if (token) {
          await loadCards();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('[MyCards] Error checking token:', error);
        setLoading(false);
      }
    };
    checkAuthAndLoad();
  }, []);

  const loadCards = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showError('Hata', 'Oturum bilgisi bulunamadı.');
        return;
      }

      const data = await getMyCards(token);
      setCards(data);
    } catch (error) {
      console.error('Kartlar yüklenirken hata:', error);
      showError('Hata', 'Kartlar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  };

  const handleDeleteCard = async (cardId: number, cardInfo: string) => {
        setSelectedCard({ id: cardId, title: cardInfo });
        setShowDeleteConfirmation(true);
      };

      const confirmDeleteCard = async () => {
        if (!selectedCard || !currentToken) return;

        try {
          setDeletingId(selectedCard.id);
          await deleteCard(currentToken, selectedCard.id);

          // Remove from local state
          setCards(prev => prev.filter(card => card.id !== selectedCard.id));
          showSuccess('Başarılı!', 'Kart başarıyla silindi.');
        } catch (error) {
          console.error('Kart silinirken hata:', error);
          showError('Hata', 'Kart silinirken hata oluştu.');
        } finally {
          setDeletingId(null);
          setShowDeleteConfirmation(false);
          setSelectedCard(null);
        }
      };

      const cancelDeleteCard = () => {
        setShowDeleteConfirmation(false);
        setSelectedCard(null);
      };

  const getBrandIcon = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'amex':
      case 'american express':
        return 'card';
      default:
        return 'card-outline';
    }
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
          <SilverText style={styles.title}>Kartlarım</SilverText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>🔐 Giriş Gerekli</Text>
            <Text style={styles.errorSubtext}>Kartlarınızı görmek için giriş yapmanız gerekiyor.</Text>
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
          <SilverText style={styles.title}>Kartlarım</SilverText>
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
          <View style={{flexDirection:'column', alignItems:'center'}}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </View>
        </Pressable>
        <SilverText style={styles.title}>Kartlarım</SilverText>
        <Pressable 
                  onPress={() => router.push('/add-card')} 
                  style={styles.addButton}
                >
                <Ionicons name="add" size={24} color="#D4AF37" />
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
          Kayıtlı kartlarınızı görüntüleyebilir, düzenleyebilir veya silebilirsiniz.
        </Text>

        {cards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color="#666666" />
            <Text style={styles.emptyTitle}>Henüz kart eklenmemiş</Text>
            <Text style={styles.emptySubtitle}>
              İlk kartınızı ekleyerek hızlı ödeme için kaydedin.
            </Text>
            <GoldenButton
              title="İlk Kartını Ekle"
              iconName="add-outline"
              onPress={() => router.push('/add-card')}
              size="medium"
            />
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {cards.map((card) => (
              <View key={card.id} style={styles.cardItem}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Ionicons name={getBrandIcon(card.brand)} size={20} color="#D4AF37" />
                    <Text style={styles.cardBrand}>{card.brand}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => router.push({
                        pathname: '/edit-card',
                        params: { id: card.id }
                      })}
                    >
                      <Ionicons name="create-outline" size={20} color="#D4AF37" />
                    </Pressable>
                    <Pressable
                      style={[styles.actionButton, deletingId === card.id && styles.actionButtonDisabled]}
                      onPress={() => handleDeleteCard(card.id, `${card.brand} •••• ${card.last4}`)}
                      disabled={deletingId === card.id}
                    >
                      {deletingId === card.id ? (
                        <ActivityIndicator size="small" color="#FF6B6B" />
                      ) : (
                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                      )}
                    </Pressable>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardNumber}>
                    •••• •••• •••• {card.last4}
                  </Text>
                  <Text style={styles.cardHolder}>
                    {card.holderName}
                  </Text>
                  <Text style={styles.cardExpiry}>
                    {card.expMonth.toString().padStart(2, '0')}/{card.expYear}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <ConfirmationDialog
        visible={showDeleteConfirmation}
        title="Kartı Sil"
        message={selectedCard ? `"${selectedCard.title}" kartını silmek istediğinizden emin misiniz?` : ''}
        confirmText="Evet, Sil"
        cancelText="İptal"
        onConfirm={confirmDeleteCard}
        onCancel={cancelDeleteCard}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addFirstButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  cardsContainer: {
    gap: 16,
  },
  cardItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardBrand: {
    color: '#D4AF37',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  cardActions: {
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
  cardContent: {
    gap: 8,
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    letterSpacing: 2,
  },
  cardHolder: {
    color: '#CCCCCC',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    textTransform: 'uppercase',
  },
  cardExpiry: {
    color: '#888888',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
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
