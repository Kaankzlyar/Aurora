import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfoFromToken } from '../api/auth';

interface UserInfo {
  name: string;
  email: string;
}

export default function ProfileScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      setIsLoading(true);
      
      // First try to get saved user info from AsyncStorage
      const savedUserInfo = await AsyncStorage.getItem('userInfo');
      
      if (savedUserInfo) {
        const parsedUserInfo = JSON.parse(savedUserInfo);
        const displayName = parsedUserInfo.name || 
                           parsedUserInfo.username || 
                           `${parsedUserInfo.firstName || ''} ${parsedUserInfo.lastName || ''}`.trim() ||
                           (parsedUserInfo.email ? parsedUserInfo.email.split('@')[0] : '') ||
                           'Kullanıcı';
        
        setUserInfo({
          name: displayName,
          email: parsedUserInfo.email || 'email@example.com'
        });
        console.log('[ProfileScreen] Loaded saved user info:', parsedUserInfo);
        console.log('[ProfileScreen] Display name:', displayName);
      } else {
        // If no saved user info, try to get from JWT token
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          console.log('[ProfileScreen] No saved user info, trying to decode JWT token...');
          const tokenUserInfo = await getUserInfoFromToken(token);
          
          if (tokenUserInfo && (tokenUserInfo.email || tokenUserInfo.name)) {
            const displayName = tokenUserInfo.fullName || 
                               tokenUserInfo.name || 
                               `${tokenUserInfo.firstName || ''} ${tokenUserInfo.lastName || ''}`.trim() ||
                               tokenUserInfo.username ||
                               (tokenUserInfo.email ? tokenUserInfo.email.split('@')[0] : '') ||
                               'Kullanıcı';
            
            const extractedInfo = {
              name: displayName,
              email: tokenUserInfo.email || 'email@example.com'
            };
            
            setUserInfo(extractedInfo);
            
            // Save the extracted info for future use
            await AsyncStorage.setItem('userInfo', JSON.stringify({
              ...extractedInfo,
              firstName: tokenUserInfo.firstName,
              lastName: tokenUserInfo.lastName,
              id: tokenUserInfo.id,
              username: tokenUserInfo.username
            }));
            
            console.log('[ProfileScreen] Extracted and saved user info from JWT:', extractedInfo);
            console.log('[ProfileScreen] Full token info was:', tokenUserInfo);
          } else {
            console.log('[ProfileScreen] Could not extract user info from JWT token');
            setUserInfo({
              name: 'Kullanıcı',
              email: 'email@example.com'
            });
          }
        } else {
          console.log('[ProfileScreen] No token found');
          setUserInfo({
            name: 'Kullanıcı', 
            email: 'email@example.com'
          });
        }
      }
    } catch (error) {
      console.error('[ProfileScreen] Error loading user info:', error);
      setUserInfo({
        name: 'Kullanıcı',
        email: 'email@example.com'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable 
          onPress={onBack}
          style={styles.backButton}
          hitSlop={12}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Profil</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>Kullanici Bilgileri</Text>
        
        {/* Profile content */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {isLoading ? 'Yükleniyor...' : userInfo.name}
              </Text>
              <Text style={styles.userEmail}>
                {isLoading ? 'Yükleniyor...' : userInfo.email}
              </Text>
            </View>
          </View>

          {/* Profile options */}
          <View style={styles.optionsList}>
            <Pressable style={styles.optionItem}>
              <Text style={styles.optionText}>Hesap Ayarlari</Text>
              <Text style={styles.optionArrow}>→</Text>
            </Pressable>
            
            <Pressable style={styles.optionItem}>
              <Text style={styles.optionText}>Siparislerim</Text>
              <Text style={styles.optionArrow}>→</Text>
            </Pressable>
            
            <Pressable style={styles.optionItem}>
              <Text style={styles.optionText}>Favorilerim</Text>
              <Text style={styles.optionArrow}>→</Text>
            </Pressable>
            
            <Pressable style={styles.optionItem}>
              <Text style={styles.optionText}>Bildirimler</Text>
              <Text style={styles.optionArrow}>→</Text>
            </Pressable>
            
            <Pressable style={styles.optionItem}>
              <Text style={styles.optionText}>Yardim ve Destek</Text>
              <Text style={styles.optionArrow}>→</Text>
            </Pressable>
          </View>
        </View>
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
    minHeight: 64,
    backgroundColor: '#0B0B0B',
    borderBottomColor: '#1A1A1A',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    bottom: 12,
    padding: 8,
  },
  backText: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    color: '#D4AF37',
    fontSize: 29,
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 30,
  },
  profileSection: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    color: '#0B0B0B',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#B3B3B3',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  optionsList: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'CormorantGaramond_500Medium',
  },
  optionArrow: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
