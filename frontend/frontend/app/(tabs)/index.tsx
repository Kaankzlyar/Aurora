import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import AuroraHeader from "../../components/AuroraHeader";
import { Link } from "expo-router";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import GoldText from "@/components/GoldText";

function FeaturedBanner({ onPress }: { onPress: () => void }) {
  console.log("FeaturedBanner rendered");
  return (
    <View style={fb.wrapper}>
      <LinearGradient
        colors={["#6b4a1f", "#4a2e17", "#2e1f12"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={fb.panel}
      >
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={["rgba(255,255,255,0.08)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.3, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.18)"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={fb.textCol}>
          <Text style={fb.overline}>FEATURED</Text>
          <Text style={fb.title}>New Arrivals</Text>
          <Text style={fb.desc}>Discover our latest collection</Text>

          <Pressable onPress={onPress} style={({ pressed }) => [fb.cta, pressed && fb.ctaPressed]}>
            <LinearGradient
              colors={["#FFE08A", "#E0B84C", "#C6921A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={fb.ctaBg}
            >
              <Text style={fb.ctaText}>EXPLORE</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
      <View pointerEvents="none" style={fb.stroke} />
    </View>
  );
}

const fb = StyleSheet.create({
  wrapper: {
    borderRadius: 18,
    overflow: "hidden",
  },
  panel: {
    padding: 20,
    minHeight: 200,
    justifyContent: "center",
  },
  stroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(212,175,55,0.45)",
  },
  textCol: { maxWidth: "80%" },
  overline: {
    color: "#B7B7B7",
    letterSpacing: 2,
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 10,
    fontFamily: "Montserrat_500Medium",
  },
  title: {
    color: "#FFF5D6",
    fontSize: 18,
    marginBottom: 6,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  desc: {
    color: "#E6E6E6",
    fontSize: 13,
    marginBottom: 14,
    fontFamily: "CormorantGaramond_400Regular",
  },
  cta: { alignSelf: "flex-start", borderRadius: 10, overflow: "hidden" },
  ctaBg: { paddingVertical: 10, paddingHorizontal: 16 },
  ctaPressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },
  ctaText: { color: "#121212", letterSpacing: 1, fontSize: 12, fontFamily: "Montserrat_500Medium" },
});

function FeaturedBannerOverlay({ topOffset }: { topOffset?: number }) {
  console.log("FeaturedBannerOverlay mounted, topOffset=", topOffset);
  return (
    <View pointerEvents="box-none" style={[overlay.container, topOffset !== undefined ? { top: topOffset } : {}]}>
      <View style={overlay.cardShadow}>
        <FeaturedBanner onPress={() => router.push('/(tabs)/explore')} />
      </View>
    </View>
  );
}

const overlay = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 160,
    zIndex: 9999,
    elevation: 9999,
  },
  cardShadow: {
    borderRadius: 18,
    overflow: "visible",
    backgroundColor: "rgba(255, 235, 170, 0.03)",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
});


export default function Home() {
  // Örnek: Sepetteki adet (gerçekte state/store’dan gelecek)
  const basketCount = useMemo(() => 2, []);

  return (
    <View style={s.container}>
      <AuroraHeader />

      <ScrollView contentContainerStyle={s.content}>
        {/* Hero / Vitrin */}
        <Text style={s.heroOverline}>ZAMANSIZ KLASİKLER</Text>
        <GoldText>Size Özel Seçimler</GoldText>
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

        {/* Featured Banner */}
        <View style={{ marginTop: 24 }}>
          <FeaturedBanner onPress={() => router.push('/(tabs)/explore')} />
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
    fontFamily: "Montserrat_500Medium",
    color: "#B3B3B3",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 11,
    marginTop: 8,
  },
  heroTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#FFFFFF",
    fontSize: 28,
    letterSpacing: 1,
    marginTop: 6,
  },
  heroBody: {
    fontFamily: "CormorantGaramond_400Regular",
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
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#D4AF37",
    fontSize: 16,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardSub: {
    fontFamily: "CormorantGaramond_400Regular",
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
    fontFamily: "CormorantGaramond_500Medium",
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
    fontFamily: "Montserrat_500Medium",
    color: "#0B0B0B",
    fontSize: 12,
  },
});
