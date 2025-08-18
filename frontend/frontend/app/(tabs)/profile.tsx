import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile } from "../../api/auth";
import { useState, useEffect, useMemo } from "react";
import AuroraHeader from "../../components/AuroraHeader";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Screen() {
  const { logout, userInfo, updateUserInfo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

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
              await logout();
              console.log('[Profile] Logout completed via AuthContext');
            } catch (error) {
              console.error('[Profile] Error during logout:', error);
              Alert.alert("Hata", "Çıkış yapılırken bir hata oluştu.");
            }
          }
        }
      ]
    );
  };

  // Extract display information from userInfo or profileData with useMemo for performance
  const currentUserData = useMemo(() => profileData || userInfo, [profileData, userInfo]);
  
  // For debugging, log the current user data
  console.log('[Profile] ===== DEBUG INFO =====');
  console.log('[Profile] userInfo from context:', userInfo);
  console.log('[Profile] profileData from API:', profileData);
  console.log('[Profile] currentUserData (merged):', currentUserData);
  console.log('[Profile] currentUserData keys:', currentUserData ? Object.keys(currentUserData) : 'null');
  console.log('[Profile] currentUserData email specifically:', currentUserData?.email);
  console.log('[Profile] ===========================');
  
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
    const result = currentUserData?.email || 'E-posta bilgisi mevcut değil';
    console.log('[Profile] displayEmail calculated:', result);
    return result;
  }, [currentUserData]);
  
  const displayId = useMemo(() => {
    return currentUserData?.id || 'ID bilgisi mevcut değil';
  }, [currentUserData]);
  
  // For phone, we don't have this in JWT, so we'll show a placeholder
  // In a real app, you might fetch additional profile data from a separate API
  const displayPhone = '+90 555 XXX XX XX (Demo)';

  // Debug function to manually trigger profile fetch
  const manualFetchProfile = async () => {
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
      
      Alert.alert(
        "AsyncStorage Debug",
        `Token: ${token ? 'EXISTS' : 'NULL'}\n\nUserInfo: ${userInfo || 'NULL'}\n\nUserEmail: ${userEmail || 'NULL'}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to read AsyncStorage: " + error);
    }
  };

  return (
    <View style={styles.container}>
      <AuroraHeader />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>👤 Hesap Bilgileri</Text>
          <Text style={styles.subtitle}>Profil ve ayarlarınız</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          
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
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Kullanıcı ID</Text>
                <Text style={styles.infoValue}>{displayId}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Telefon</Text>
                <Text style={styles.infoValue}>{displayPhone}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug İşlemleri</Text>
          
          <Pressable style={styles.actionButton} onPress={checkAsyncStorage}>
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionText}>AsyncStorage Kontrol Et</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={manualFetchProfile}>
            <Text style={styles.actionIcon}>📡</Text>
            <Text style={styles.actionText}>Manual Profile Fetch</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap İşlemleri</Text>
          
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Siparişlerim</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionIcon}>❤️</Text>
            <Text style={styles.actionText}>Favorilerim</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Ayarlar</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={handleLogout}>
            <Text style={styles.actionIcon}>🚪</Text>
            <Text style={styles.actionText}>Çıkış Yap</Text>
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
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay_700Bold",
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
    fontSize: 18,
    fontFamily: "PlayfairDisplay_600SemiBold",
    color: "#FFFFFF",
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
    color: "#D4AF37",
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