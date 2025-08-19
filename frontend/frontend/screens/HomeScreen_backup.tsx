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

/* function FeaturedBannerOverlay({ topOffset }: { topOffset?: number }) {
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
}); */

