import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import AuroraHeader from "../../components/AuroraHeader";
import { Link } from "expo-router";
import { useMemo } from "react";

export default function Home() {
  // Örnek: Sepetteki adet (gerçekte state/store’dan gelecek)
  const basketCount = useMemo(() => 2, []);

  return (
    <View style={s.container}>
      <AuroraHeader />

      <ScrollView contentContainerStyle={s.content}>
        {/* Hero / Vitrin */}
        <Text style={s.heroOverline}>ZAMANSIZ KLASİKLER</Text>
        <Text style={s.heroTitle}>Size Özel Seçimler</Text>
        <Text style={s.heroBody}>
          Gucci, Prada, Tom Ford - yalnızca seçkin üyeler için kürasyon.
        </Text>

        {/* Koleksiyon kartlarına giden kısayollar (örnek) */}
        <View style={s.cardsRow}>
          <Link href="/collection" asChild>
            <Pressable style={s.card}>
              <Text style={s.cardTitle}>Yeni Gelenler</Text>
              <Text style={s.cardSub}>Bu hafta eklendi</Text>
            </Pressable>
          </Link>

          <Link href="/profile" asChild>
            <Pressable style={s.card}>
              <Text style={s.cardTitle}>İkonik Seçimler</Text>
              <Text style={s.cardSub}>Sınırlı stok</Text>
            </Pressable>
          </Link>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sabit “Koleksiyonum” (sepet) butonu */}
      <Link href="/collection" asChild>
        <Pressable style={s.collectionFab} accessibilityLabel="Koleksiyonum">
          <Text style={s.collectionText}>Koleksiyonum</Text>
          {basketCount > 0 && (
            <View style={s.badge}><Text style={s.badgeText}>{basketCount}</Text></View>
          )}
        </Pressable>
      </Link>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  content: { padding: 20 },
  heroOverline: {
    fontFamily: "Montserrat-Medium",
    color: "#B3B3B3",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 11,
    marginTop: 8,
  },
  heroTitle: {
    fontFamily: "PlayfairDisplay-Bold",
    color: "#FFFFFF",
    fontSize: 28,
    letterSpacing: 1,
    marginTop: 6,
  },
  heroBody: {
    fontFamily: "CormorantGaramond-Regular",
    color: "#E0E0E0",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
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
    fontFamily: "PlayfairDisplay-Bold",
    color: "#D4AF37",
    fontSize: 16,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardSub: {
    fontFamily: "CormorantGaramond-Regular",
    color: "#CFCFCF",
    fontSize: 13,
    marginTop: 6,
  },

  collectionFab: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
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
    fontFamily: "Montserrat-Medium",
    color: "#FFFFFF",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 12,
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
    fontFamily: "Montserrat-Medium",
    color: "#0B0B0B",
    fontSize: 12,
  },
});
