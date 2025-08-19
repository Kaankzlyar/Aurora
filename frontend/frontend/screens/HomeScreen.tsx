import { View, Text, StyleSheet, ScrollView, Pressable, Button } from "react-native";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';


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
          <Text style={fb.desc}>Discover our latest collection of luxury pieces</Text>

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
    marginBottom: 6,
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

export default function HomeScreen({
  onLogout,
  onNavigateToCollection,
  onNavigateToProfile,
}: {
  onLogout: () => void;
  onNavigateToCollection: () => void;
  onNavigateToProfile: () => void;
}) {
  const basketCount = useMemo(() => 2, []);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.brand}>AURORA</Text>
        <Pressable hitSlop={12} style={styles.profileBtn} accessibilityLabel="Profil" onPress={onNavigateToProfile}>
          <Text style={styles.profileEmoji}>👤</Text>
        </Pressable>
      </View> */}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: 320 }]}
      >
        {/* <Text style={styles.heroOverline}>ZAMANSIZ KLASİKLER</Text>
        <Text style={styles.heroTitle}>Size Özel Seçimler</Text>
        <Text style={styles.heroBody}>
          Gucci, Prada, Tom Ford - yalnızca seçkin üyeler için kürasyon.
        </Text> */}

        <View style={{ height: 24 }} />
        <FeaturedBanner onPress={() => router.push('/(tabs)/explore')} />

        {/* <View style={styles.iconicSection}>
          <Text style={styles.iconicOverline}>FEATURED</Text>
          <Text style={styles.iconicTitle}>İkonik Seçimler</Text>
          <Text style={styles.iconicDesc}>Zamansız, öne çıkan parçalar — keşfedin.</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconicRow}>
            {[1,2,3,4].map((i) => (
              <Pressable key={i} style={styles.iconCard} onPress={() => router.push('/(tabs)/explore')}>
                <View style={styles.iconImagePlaceholder} />
                <Text numberOfLines={1} style={styles.iconCardTitle}>Seçim {i}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View> */}

        <View style={{ height: 600 }} />
      </ScrollView>

      {/* <FeaturedBannerOverlay topOffset={insets.top + 40} /> */}

      {/* <Pressable style={styles.collectionFab} accessibilityLabel="Koleksiyonum" onPress={onNavigateToCollection}>
        <Text style={styles.collectionText}>KOLEKSİYONUM</Text>
        {basketCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{basketCount}</Text>
          </View>
        )}
      </Pressable> */}

      {/* <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={onLogout} />
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  header: {
    position: "relative",
    marginTop: 16,
    minHeight: 84,
    zIndex: 1,
    elevation: 1,
    backgroundColor: "#0B0B0B",
    borderBottomColor: "#1A1A1A",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  brand: {
    position: "absolute",
    left: 22,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#C48913",
    fontSize: 29,
    fontFamily: "PlayfairDisplay_700Bold",
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
    fontFamily: "Montserrat_500Medium",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 35,
    letterSpacing: 1,
    marginTop: 6,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  heroBody: {
    color: "#E0E0E0",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    fontFamily: "CormorantGaramond_400Regular",
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
    borderWidth: 1.5,
    borderColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionText: {
    fontWeight: "500",
    color: "#FFFFFF",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 11,
    fontFamily: "CormorantGaramond_500Medium",
  },
  badge: {
    position: "absolute",
    right: 14,
    top: 8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#C48913",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { fontWeight: "500", color: "#0B0B0B", fontSize: 12, fontFamily: "Montserrat_500Medium" },
  logoutContainer: { position: "absolute", bottom: 20, left: 20, right: 20 },
  iconicSection: { marginTop: 18 },
  iconicOverline: {
    color: "#B7B7B7",
    letterSpacing: 2,
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 6,
    fontFamily: "Montserrat_500Medium",
  },
  iconicTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 6,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  iconicDesc: {
    color: "#DADADA",
    fontSize: 13,
    marginBottom: 12,
    fontFamily: "CormorantGaramond_400Regular",
  },
  iconicRow: { flexDirection: "row" },
  iconCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#0F0F0F",
    padding: 10,
    alignItems: "center",
  },
  iconImagePlaceholder: {
    width: "100%",
    height: 90,
    borderRadius: 8,
    backgroundColor: "#222",
    marginBottom: 8,
  },
  iconCardTitle: { color: "#FFFFFF", fontSize: 13, fontFamily: "Montserrat_500Medium" },
});
