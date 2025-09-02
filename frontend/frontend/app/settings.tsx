import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AuroraHeader from '../components/AuroraHeader';
import SilverText from '../components/SilverText';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setCurrentToken(token);
        console.log('[Settings] Token checked:', token ? 'FOUND' : 'NOT_FOUND');
        console.log('[Settings] isAuthenticated from context:', isAuthenticated);
        console.log('[Settings] Will show content?', isAuthenticated || token);
      } catch (error) {
        console.error('[Settings] Error checking token:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <View style={styles.container}>
        <AuroraHeader />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Ionicons name="arrow-back-outline" size={24} color="#D4AF37" />
            </View>
          </Pressable>
          <SilverText style={styles.title}>Ayarlar</SilverText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  // Show login required only if definitely not authenticated AND no token exists
  if (!isAuthenticated && !currentToken) {
    return (
      <View style={styles.container}>
        <AuroraHeader />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Ionicons name="arrow-back-outline" size={24} color="#D4AF37" />
            </View>
          </Pressable>
          <SilverText style={styles.title}>Ayarlar</SilverText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>🔐 Giriş Gerekli</Text>
            <Text style={styles.errorSubtext}>Ayarlara erişmek için giriş yapmanız gerekiyor.</Text>
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

  const menuItems = [
    {
      id: 'addresses',
      title: 'Adreslerim',
      subtitle: 'Teslimat adreslerini yönet',
      icon: 'location-outline',
      onPress: () => router.push('/my-addresses'),
    },
    {
      id: 'cards',
      title: 'Kartlarım',
      subtitle: 'Ödeme kartlarını yönet',
      icon: 'card-outline',
      onPress: () => router.push('/my-cards'),
    },
    {
      id: 'orders',
      title: 'Siparişlerim',
      subtitle: 'Sipariş geçmişini görüntüle',
      icon: 'receipt-outline',
      onPress: () => router.push('/orders'),
    },
    {
      id: 'profile',
      title: 'Profil Bilgileri',
      subtitle: 'Kişisel bilgilerini düzenle',
      icon: 'person-outline',
      onPress: () => router.push('/(tabs)/profile'),
    },
    /* {
      id: 'notifications',
      title: 'Bildirimler',
      subtitle: 'Bildirim tercihlerini ayarla',
      icon: 'notifications-outline',
      onPress: () => {
        // TODO: Implement notifications settings
      },
    }, */
    /* {
      id: 'help',
      title: 'Yardım & Destek',
      subtitle: 'SSS ve iletişim',
      icon: 'help-circle-outline',
      onPress: () => {
        // TODO: Implement help & support
      },
    }, */
    /* {
      id: 'about',
      title: 'Hakkında',
      subtitle: 'Uygulama bilgileri',
      icon: 'information-circle-outline',
      onPress: () => {
        // TODO: Implement about page
      },
    }, */
    {
      id: 'logout',
      title: 'Çıkış Yap',
      subtitle: 'Hesabından çıkış yap',
      icon: 'log-out-outline',
      onPress: handleLogout,
      isDestructive: true,
    },
  ];

  return (
    <View style={styles.container}>
      <AuroraHeader />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <View style={{flexDirection:'row', alignItems:'center'}}>
              <Ionicons name="arrow-back-outline" size={24} color="#D4AF37" />
            </View>
        </Pressable>
        <SilverText style={styles.title}>Ayarlar</SilverText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Hesap ayarlarınızı ve tercihlerinizi buradan yönetebilirsiniz.
        </Text>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.id}
              style={[
                styles.menuItem,
                item.isDestructive && styles.destructiveMenuItem,
                index === menuItems.length - 1 && styles.lastMenuItem
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[
                  styles.iconContainer,
                  item.isDestructive && styles.destructiveIconContainer
                ]}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={24} 
                    color={item.isDestructive ? "#FF6B6B" : "#D4AF37"} 
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[
                    styles.menuItemTitle,
                    item.isDestructive && styles.destructiveText
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={styles.menuItemSubtitle}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={item.isDestructive ? "#FF6B6B" : "#666666"} 
              />
            </Pressable>
          ))}
        </View>
        
        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  menuContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  destructiveMenuItem: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destructiveIconContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  textContainer: {
    flex: 1,
  },
  menuItemTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 4,
  },
  destructiveText: {
    color: '#FF6B6B',
  },
  menuItemSubtitle: {
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
