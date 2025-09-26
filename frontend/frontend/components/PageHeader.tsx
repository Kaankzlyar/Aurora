/**
 * 📱 PAGE HEADER - Geri Butonu ile Header Komponenti
 * 
 * Bu komponent, sepet ve keşfet sayfaları için geri butonu ve başlık içeren header'ı sağlar.
 * SafeArea ile bildirim çubuğundan kaçınır ve Aurora teması kullanır.
 */

import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export default function PageHeader({ 
  title, 
  showBackButton = true, 
  onBackPress,
  rightComponent 
}: PageHeaderProps) {
  
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 🔙 GERİ BUTONU */}
        {showBackButton && (
          <Pressable 
            style={styles.backButton}
            onPress={handleBackPress}
            hitSlop={12}
            accessibilityLabel="Geri"
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
        )}
        
        {/* 📝 BAŞLIK */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        
        {/* 🔧 SAĞ KOMPONENTLer */}
        <View style={styles.rightContainer}>
          {rightComponent}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0B0B0B',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0B0B0B',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    minHeight: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  backIcon: {
    fontSize: 18,
    color: '#C48913',
    fontFamily: 'Montserrat_600SemiBold',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#C48913',
    textAlign: 'center',
    letterSpacing: 1,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
});
