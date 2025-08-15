import { View, Text, StyleSheet, ScrollView, Pressable, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMemo } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";

function FeaturedBanner({ onPress }: { onPress: () => void }) {
  return (
    <View style={fb.wrapper}>
      {/* İç parlaklık / “glass” derinliği için hafif blur istiyorsan:
         <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} /> */}
      {/* Altın-sicak degrade panel */}
      <LinearGradient
  colors={["#3b2a16", "#3a2312", "#2b1c10"]}
  start={{ x: 0, y: 0.5 }}
  end={{ x: 1, y: 0.5 }}
  style={fb.panel}
>
  {/* Parıltı overlay */}
  <View style={StyleSheet.absoluteFill}>
    <LinearGradient
      colors={["rgba(255,255,255,0.08)", "transparent"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  </View>

  {/* Metin ve buton */}
  <View style={fb.textCol}>
    <Text style={fb.overline}>FEATURED</Text>
    <Text style={fb.title}>New Arrivals</Text>
    <Text style={fb.desc}>
      Discover our latest collection of luxury pieces
    </Text>

    <Pressable onPress={onPress} style={fb.cta}>
      <Text style={fb.ctaText}>EXPLORE</Text>
    </Pressable>
  </View>
</LinearGradient>

      {/* İnce altın çerçeve */}
      <View pointerEvents="none" style={fb.stroke} />
    </View>
  );
}

const fb = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    marginTop: 24,
    overflow: "hidden",
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  panel: {
    padding: 18,
    minHeight: 120,
    justifyContent: "center",
  },
  stroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)", // Aurora gold ince çerçeve
  },
  textCol: {
    maxWidth: "80%",
  },
  overline: {
    color: "#B7B7B7",
    letterSpacing: 2,
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 6,
    fontFamily: "Montserrat_500Medium",
  },
  title: {
    color: "#F4E6C1",
    fontSize: 18,
    marginBottom: 6,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  desc: {
    color: "#D9D9D9",
    fontSize: 13,
    marginBottom: 14,
    fontFamily: "CormorantGaramond_400Regular",
  },
  cta: {
    alignSelf: "flex-start",
    backgroundColor: "#C48913",           // altın düğme
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  ctaText: {
    color: "#121212",
    letterSpacing: 1,
    fontSize: 12,
    fontFamily: "Montserrat_500Medium",
  },
});


export default function HomeScreen({ 
  onLogout, 
  onNavigateToCollection,
  onNavigateToProfile
}: { 
  onLogout: () => void;
  onNavigateToCollection: () => void;
  onNavigateToProfile: () => void;
}) {
  // Example basket count (would come from state/store in real app)
  const basketCount = useMemo(() => 2, []);
  
  // Get safe area insets to avoid overlapping with status bar
  const insets = useSafeAreaInsets();

  const handleProfilePress = () => {
    console.log("Profile pressed");
    onNavigateToProfile();
  };

  const handleCollectionPress = () => {
    console.log("Collection pressed");
    onNavigateToCollection();
  };


  return (
    <View style={styles.container}>
      {/* Aurora Header with safe area */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.brand}>AURORA</Text>
        <Pressable 
          hitSlop={12} 
          style={styles.profileBtn} 
          accessibilityLabel="Profil"
          onPress={handleProfilePress}
        >
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
        <FeaturedBanner onPress={() => {
    // örn: Yeni Gelenler sayfasına git
    console.log("Explore New Arrivals");
    // onNavigateToExplore(); veya router.push("/collections/new")
  }} />

        {/* Collection cards shortcuts */}
       
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed "My Collection" (cart) button */}
      <Pressable 
        style={styles.collectionFab} 
        accessibilityLabel="Koleksiyonum"
        onPress={handleCollectionPress}
      >
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
    minHeight: 84,
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
    color: "#C48913",
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
    fontSize: 11,
    fontFamily: 'CormorantGaramond_500Medium',
  },
  badge: {
    position: "absolute",
    right: 14, top: 8,
    minWidth: 22, height: 22,
    borderRadius: 11,
    backgroundColor: "#C48913",
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
