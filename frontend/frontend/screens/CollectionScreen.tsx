import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CollectionScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();

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
        <Text style={styles.title}>Koleksiyonum</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>Seçtiğiniz Ürünler</Text>
        
        {/* Placeholder for collection items */}
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Koleksiyonunuz henüz boş</Text>
          <Text style={styles.emptySubtext}>
            Beğendiğiniz ürünleri buraya ekleyerek kişisel koleksiyonunuzu oluşturun.
          </Text>
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
    fontSize: 29,
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
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#E0E0E0',
    fontSize: 18,
    fontFamily: 'CormorantGaramond_500Medium',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#B3B3B3',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
