import { View, Text, StyleSheet, ScrollView, Pressable, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMemo } from "react";

export default function HomeScreen({ onLogout }: { onLogout: () => void }) {
  // Example basket count (would come from state/store in real app)
  const basketCount = useMemo(() => 2, []);

  return (
    <View style={styles.container}>
      {/* Aurora Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>AURORA</Text>
        <Pressable hitSlop={12} style={styles.profileBtn} accessibilityLabel="Profil">
          <Text style={styles.profileEmoji}>👤</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero / Showcase */}
        <Text style={styles.heroOverline}>ZAMANSIZ KLASİKLER</Text>
        <Text style={styles.heroTitle}>Size Özel Seçimler</Text>
        <Text style={styles.heroBody}>
          Gucci, Prada, Tom Ford - yalnızca seçkin üyeler için kürasyon.
        </Text>

        {/* Collection cards shortcuts */}
        <View style={styles.cardsRow}>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>Yeni Gelenler</Text>
            <Text style={styles.cardSub}>Bu hafta eklendi</Text>
          </Pressable>

          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>İkonik Seçimler</Text>
            <Text style={styles.cardSub}>Sınırlı stok</Text>
          </Pressable>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed "My Collection" (cart) button */}
      <Pressable style={styles.collectionFab} accessibilityLabel="Koleksiyonum">
        <Text style={styles.collectionText}>Koleksiyonum</Text>
        {basketCount > 0 && (
          <View style={styles.badge}><Text style={styles.badgeText}>{basketCount}</Text></View>
        )}
      </Pressable>

      {/* Temporary logout button */}
      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={onLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  header: {
    height: 64,
    backgroundColor: "#0B0B0B",
    borderBottomColor: "#1A1A1A",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    position: "absolute",
    left: 22,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#D4AF37",
    fontSize: 25,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  profileBtn: { position: "absolute", right: 12, padding: 6 },
  profileEmoji: { fontSize: 22 },
  content: { padding: 20 },
  heroOverline: {
    fontWeight: "500",
    color: "#B3B3B3",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 11,
    marginTop: 8,
    fontFamily: 'Montserrat_500Medium',
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 35,
    letterSpacing: 1,
    marginTop: 6,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  heroBody: {
    color: "#E0E0E0",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    fontFamily: 'CormorantGaramond_400Regular',
  },
  cardsRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  card: {
    flex: 1,
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  cardTitle: {
    fontWeight: "bold",
    color: "#D4AF37",
    fontSize: 16,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  cardSub: {
    color: "#CFCFCF",
    fontSize: 13,
    marginTop: 6,
    fontFamily: 'CormorantGaramond_400Regular',
  },
  collectionFab: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 80,
    backgroundColor: "#141414",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionText: {
    fontWeight: "500",
    color: "#FFFFFF",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 12,
    fontFamily: 'CormorantGaramond_500Medium',
  },
  badge: {
    position: "absolute",
    right: 14, top: 8,
    minWidth: 22, height: 22,
    borderRadius: 11,
    backgroundColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontWeight: "500",
    color: "#0B0B0B",
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  logoutContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
});
