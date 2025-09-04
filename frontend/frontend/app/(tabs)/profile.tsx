import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile } from "../../api/auth";
import { useState, useEffect, useMemo } from "react";
import AuroraHeader from "../../components/AuroraHeader";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import SilverText from "@/components/SilverText";

export default function Screen() {
  const { logout, userInfo, updateUserInfo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [asyncStorageEmail, setAsyncStorageEmail] = useState<string | null>(null);

  // 📧 AsyncStorage'dan email'i direkt yükle
  useEffect(() => {
    const loadEmailFromStorage = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('userEmail');
        console.log('[Profile] AsyncStorage email yüklendi:', savedEmail);
        setAsyncStorageEmail(savedEmail);
      } catch (error) {
        console.error('[Profile] AsyncStorage email yüklenemedi:', error);
      }
    };
    
    loadEmailFromStorage();
  }, []);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      // Don't fetch if we already have userInfo from context
      if (userInfo && Object.keys(userInfo).length > 0) {
        console.log('[Profile] Using existing userInfo from context');
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('[Profile] Fetching user profile...');
        const result = await getUserProfile();
        
        if (result.success && result.user) {
          console.log('[Profile] Profile fetched successfully:', result.user);
          
          // Only update if the data is different
          const isDifferent = JSON.stringify(profileData) !== JSON.stringify(result.user);
          if (isDifferent) {
            setProfileData(result.user);
            updateUserInfo(result.user);
          }
        } else {
          console.log('[Profile] Profile fetch failed, using existing userInfo');
        }
      } catch (error) {
        console.error('[Profile] Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []); // Remove updateUserInfo dependency to prevent infinite re-renders

  const handleLogout = async () => {
    Alert.alert(
      "Çıkış Yap",
      "Çıkış yapmak istediğinizden emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('[Profile] User confirmed logout');
              
              // Clear all local state first
              setProfileData(null);
              setAsyncStorageEmail(null);
              
              // Then logout via AuthContext
              await logout();
              
              console.log('[Profile] Logout completed via AuthContext');
              
              // Force navigation to login (as backup)
              // The AuthContext should handle this, but let's ensure it works
              import('expo-router').then(({ router }) => {
                router.replace('/(auth)/login');
              });
              
            } catch (error) {
              console.error('[Profile] Error during logout:', error);
              Alert.alert("Hata", "Çıkış yapılırken bir hata oluştu: " + error.message);
            }
          }
        }
      ]
    );
  };

  // Extract display information from userInfo or profileData with useMemo for performance
  const currentUserData = useMemo(() => profileData || userInfo, [profileData, userInfo]);
  
  
  
  const displayName = useMemo(() => {
    const result = currentUserData?.fullName || 
           currentUserData?.name || 
           currentUserData?.username ||
           `${currentUserData?.firstName || ''} ${currentUserData?.lastName || ''}`.trim() ||
           'Kullanıcı';
    console.log('[Profile] displayName calculated:', result);
    return result;
  }, [currentUserData]);
  
  const displayEmail = useMemo(() => {
    // Öncelik sırası: currentUserData.email -> asyncStorageEmail -> fallback
    const email = currentUserData?.email || asyncStorageEmail || 'E-posta bilgisi mevcut değil';
    console.log('[Profile] ===== EMAIL DEBUG =====');
    console.log('[Profile] currentUserData.email:', currentUserData?.email);
    console.log('[Profile] asyncStorageEmail:', asyncStorageEmail);
    console.log('[Profile] Final displayEmail:', email);
    console.log('[Profile] ===========================');
    return email;
  }, [currentUserData, asyncStorageEmail]);
  
  const displayId = useMemo(() => {
    return currentUserData?.id || 'ID bilgisi mevcut değil';
  }, [currentUserData]);
  
  // For phone, we don't have this in JWT, so we'll show a placeholder
  // In a real app, you might fetch additional profile data from a separate API
  const displayPhone = '+90 555 XXX XX XX (Demo)';

  // Debug function to manually trigger profile fetch
  /* const manualFetchProfile = async () => {
    setIsLoading(true);
    try {
      console.log('[Profile] Manual fetch triggered...');
      const result = await getUserProfile();
      
      Alert.alert(
        "Manual Fetch Result",
        `Success: ${result.success ? 'YES' : 'NO'}\n\nData: ${JSON.stringify(result, null, 2)}`,
        [{ text: "OK" }]
      );
      
      if (result.success && result.user) {
        setProfileData(result.user);
        updateUserInfo(result.user);
      }
    } catch (error) {
      Alert.alert("Error", "Manual fetch failed: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debug function to check AsyncStorage
  const checkAsyncStorage = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      const userEmail = await AsyncStorage.getItem('userEmail');
      
      console.log('[Profile] ===== ASYNC STORAGE DEBUG =====');
      console.log('[Profile] Token:', token ? 'EXISTS' : 'NULL');
      console.log('[Profile] UserInfo raw:', userInfo);
      console.log('[Profile] UserEmail:', userEmail);
      console.log('[Profile] asyncStorageEmail state:', asyncStorageEmail);
      console.log('[Profile] currentUserData:', currentUserData);
      console.log('[Profile] displayEmail result:', displayEmail);
      console.log('[Profile] =====================================');
      
      let parsedUserInfo = null;
      if (userInfo) {
        try {
          parsedUserInfo = JSON.parse(userInfo);
        } catch (e) {
          console.log('[Profile] UserInfo parse hatası:', e);
        }
      }
      
      Alert.alert(
        "📱 AsyncStorage Debug",
        `Token: ${token ? '✅ MEVCUT' : '❌ YOK'}\n\n` +
        `UserEmail: ${userEmail || '❌ YOK'}\n\n` +
        `State Email: ${asyncStorageEmail || '❌ YOK'}\n\n` +
        `Display Email: ${displayEmail}\n\n` +
        `UserInfo Email: ${parsedUserInfo?.email || '❌ YOK'}\n\n` +
        `Context UserInfo: ${userInfo ? 'MEVCUT' : '❌ YOK'}`,
        [
          { text: "Tamam", style: "default" },
          { text: "Reload Email", onPress: async () => {
            const freshEmail = await AsyncStorage.getItem('userEmail');
            setAsyncStorageEmail(freshEmail);
            Alert.alert("Email Reloaded", `New email: ${freshEmail || 'NULL'}`);
          }}
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to read AsyncStorage: " + error);
    }
  }; */

  return (
    <View style={styles.container}>
      <AuroraHeader />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="person-outline" size={24} color={"#FFFFFF"} />
            <SilverText style={[styles.title, {marginLeft: 8, marginTop: 8}]}>Hesap Bilgileri</SilverText>
          </View>
          <Text style={styles.subtitle}>Profil ve ayarlarınız</Text>
        </View>
        
        <View style={styles.section}>
          <SilverText style={styles.sectionTitle}>Kişisel Bilgiler</SilverText>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Bilgiler yükleniyor...</Text>
            </View>
          ) : (
            <>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ad Soyad</Text>
                <Text style={styles.infoValue}>{displayName}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>E-posta</Text>
                <Text style={styles.infoValue}>{displayEmail}</Text>
              </View>
             
              {/* <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Telefon</Text>
                <Text style={styles.infoValue}>{displayPhone}</Text>
              </View> */}
            </>
          )}
        </View>

        <View style={styles.section}>
          <SilverText style={styles.sectionTitle}>Hesap İşlemleri</SilverText>
          
          <Pressable 
            style={styles.actionButton}
                            onPress={() => router.push('/orders')}
          >
            <Ionicons name="cart-outline" size={24} color={"#D4AF37"} />
            <Text style={[styles.actionText, {marginLeft: 8}]}>Siparişlerim</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          
          <Pressable 
          style={styles.actionButton}
          onPress={() => router.push('/favorites')}
          >
            <Ionicons name="heart-outline" size={24} color={"#D4AF37"} />
            <Text style={[styles.actionText, {marginLeft: 8}]}>Favorilerim</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}
          onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={24} color={"#D4AF37"} />
            <Text style={[styles.actionText, {marginLeft: 8}]}>Ayarlar</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={"#FF6B6B"} />
            <Text style={[styles.actionText, {marginLeft: 8}]}>Çıkış Yap</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          
          
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: "Montserrat_600SemiBold",
    color: "#D4AF37",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
    color: "#D4AF37",
    marginBottom: 16,
  },
  infoItem: {
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: "Montserrat_500Medium",
    color: "#FFFFFF",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: "center",
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    color: "#FFFFFF",
  },
  actionArrow: {
    fontSize: 20,
    color: "#C48913",
    fontFamily: "Montserrat_400Regular",
  },
  loadingContainer: {
    backgroundColor: "#1A1A1A",
    padding: 24,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
});