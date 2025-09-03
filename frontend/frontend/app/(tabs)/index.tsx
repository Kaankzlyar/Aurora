import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import AuroraHeader from "../../components/AuroraHeader";
import { Link } from "expo-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import GoldText from "../../components/GoldText";
import { Redirect } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import SilverText from "../../components/SilverText";
import HomeSlider from "../../components/HomeSlider";
import { getCart } from "../../services/cart";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { get } from "http";





// === BronzeBanner with countdown timer ===
function BronzeBanner({ onPress }: { onPress: () => void }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const difference = endOfDay.getTime() - now.getTime();
    
    if (difference > 0) {
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds });
    } else {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
    }
  }, []);

  useEffect(() => {
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const formatTime = useCallback((num: number): string => num.toString().padStart(2, '0'), []);

  return (
    <View style={bb.wrapper}>
      <LinearGradient
        colors={["#8B4513", "#6B3410", "#4A2608"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.4 }}  
        style={bb.panel}
      >
        {/* Subtle highlight overlay */}
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={["rgba(255,255,255,0.12)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.4, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
        {/* Diagonal shadow */}
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.25)"]}
            start={{ x: 0.6, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={bb.content}>
          {/* Countdown Timer */}
          <View style={bb.timerContainer}>
            <Text style={bb.timerLabel}>SPECIAL FOR TODAY</Text>
            <View style={bb.timerRow}>
              <View style={bb.timeUnit}>
                <Text style={bb.timeNumber}>{formatTime(timeLeft.hours)}</Text>
                <Text style={bb.timeLabel}>H</Text>
              </View>
              <Text style={bb.timeSeparator}>:</Text>
              <View style={bb.timeUnit}>
                <Text style={bb.timeNumber}>{formatTime(timeLeft.minutes)}</Text>
                <Text style={bb.timeLabel}>M</Text>
              </View>
              <Text style={bb.timeSeparator}>:</Text>
              <View style={bb.timeUnit}>
                <Text style={bb.timeNumber}>{formatTime(timeLeft.seconds)}</Text>
                <Text style={bb.timeLabel}>S</Text>
              </View>
            </View>
          </View>

          {/* Main content */}
          <View style={bb.textContent}>
            <Text style={bb.overline}>TIMELESS CLASSICS</Text>
            <Text style={bb.title}>Choices for You</Text>
            <Text style={bb.desc}>only for selected members.</Text>

            <Pressable onPress={onPress} style={({ pressed }) => [bb.cta, pressed && bb.ctaPressed]}>
              <LinearGradient
                colors={["#D2B48C", "#CD853F", "#A0522D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={bb.ctaBg}
              >
                <Text style={bb.ctaText}>EXPLORE</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {/* Bronze border */}
      <View pointerEvents="none" style={bb.stroke} />
    </View>
  );
}

const bb = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  panel: {
    padding: 24,
    minHeight: 200,
  },
  stroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(210, 180, 140, 0.5)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 4,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerLabel: {
    color: "#D2B48C",
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 12,
    fontFamily: "Montserrat_500Medium",
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeUnit: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 40,
  },
  timeNumber: {
    color: "#F5DEB3",
    fontSize: 24,
    fontFamily: "PlayfairDisplay_700Bold",
    lineHeight: 28,
  },
  timeLabel: {
    color: "#D2B48C",
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: "Montserrat_500Medium",
    marginTop: 2,
  },
  timeSeparator: {
    color: "#D2B48C",
    fontSize: 20,
    fontFamily: "PlayfairDisplay_700Bold",
    marginHorizontal: 4,
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
    width: '100%',
  },
  overline: {
    color: "#D2B48C",
    letterSpacing: 2,
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: 8,
    fontFamily: "Montserrat_500Medium",
  },
  title: {
    color: "#F5DEB3",
    fontSize: 22,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: "PlayfairDisplay_700Bold",
    width: '100%',
    flexWrap: 'wrap',
  },
  desc: {
    color: "#E6D3B7",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: "CormorantGaramond_400Regular",
    width: '100%',
    flexWrap: 'wrap',
  },
  cta: { 
    alignSelf: "center", 
    borderRadius: 12, 
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  ctaBg: { 
    paddingVertical: 12, 
    paddingHorizontal: 20 
  },
  ctaPressed: { 
    transform: [{ scale: 0.97 }], 
    opacity: 0.95 
  },
  ctaText: {
    color: "#2F1B14",
    letterSpacing: 1.5,
    fontSize: 12,
    fontFamily: "Montserrat_500Medium",
  },
});

// === IconicBanner (silver theme) ===
function IconicBanner({ onPress }: { onPress: () => void }) {
  return (
    <View style={ib.wrapper}>
      {/* arka panel: soğuk gri degrade */}
      <LinearGradient
        colors={["#3C3F44", "#2C2F33", "#1C1F22"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={ib.panel}
      >
        {/* hafif ışık vurgusu */}
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={["rgba(255,255,255,0.10)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.35, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
        {/* sağ üstten diyagonal karartma */}
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.20)"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* içerik */}
        <View style={ib.textCol}>
          <Text style={ib.overline}>CURATED</Text>
          <Text style={ib.title}>Iconic Selections</Text>
          <Text style={ib.desc}>Timeless signatures, hand‑picked for you</Text>

          <Pressable onPress={onPress} style={({ pressed }) => [ib.cta, pressed && ib.ctaPressed]}>
            {/* platin düğme */}
            <LinearGradient
              colors={["#F3F4F6", "#D6DAE0", "#B7BCC6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={ib.ctaBg}
            >
              <Text style={ib.ctaText}>EXPLORE</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>

      {/* ince gümüş çerçeve */}
      <View pointerEvents="none" style={ib.stroke} />
    </View>
  );
}

const ib = StyleSheet.create({
  wrapper: {
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  panel: {
    padding: 20,
    minHeight: 160,
    justifyContent: "center",
  },
  stroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(192, 197, 206, 0.45)", // silver stroke
  },
  textCol: { maxWidth: "80%" },
  overline: {
    color: "#C9CDD3",
    letterSpacing: 2,
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 8,
    fontFamily: "Montserrat_500Medium",
  },
  title: {
    color: "#E9EAED",
    fontSize: 18,
    marginBottom: 6,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  desc: {
    color: "#D0D3D8",
    fontSize: 13,
    marginBottom: 14,
    fontFamily: "CormorantGaramond_400Regular",
  },
  cta: { alignSelf: "flex-start", borderRadius: 10, overflow: "hidden" },
  ctaBg: { paddingVertical: 10, paddingHorizontal: 16 },
  ctaPressed: { transform: [{ scale: 0.98 }], opacity: 0.96 },
  ctaText: {
    color: "#0F1114",
    letterSpacing: 1,
    fontSize: 12,
    fontFamily: "Montserrat_500Medium",
    width: '100%',
  },
});

function FeaturedBanner({ onPress }: { onPress: () => void }) {
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
  ctaText: { 
    color: "#121212", 
    letterSpacing: 1, 
    fontSize: 11, 
    fontFamily: "Montserrat_500Medium",
    width: '100%',
   },
});



// HomeTab Content Component (internal)
function HomeTabContent() {
  // Get user info from auth context
  const { userInfo, refreshUserInfoFromToken } = useAuth();
  
  // Basket count from cart service
  const [basketCount, setBasketCount] = useState(0);
  
  // Refresh state for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Load cart count
  const loadCartCount = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setBasketCount(0);
        return;
      }

      const cartData = await getCart(token);
      setBasketCount(cartData.totalQuantity || 0);
      console.log('[HomeTab] Cart count loaded:', cartData.totalQuantity);
    } catch (error) {
      console.error('[HomeTab] Error loading cart count:', error);
      setBasketCount(0);
    }
  }, []);

  // Load cart count on component mount and when user info changes
  useEffect(() => {
    loadCartCount();
  }, [loadCartCount, userInfo]);

  // Refresh cart count when the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('[HomeTab] Tab focused, refreshing cart count');
      loadCartCount();

      // Set up periodic refresh while tab is focused
      const interval = setInterval(() => {
        loadCartCount();
      }, 30000); // Refresh every 30 seconds

      // Cleanup interval when tab loses focus
      return () => {
        clearInterval(interval);
      };
    }, [loadCartCount])
  );


  const getUserName = useCallback((info: any): string | null => {
  if (!info) return null;
  if (info.fullName && info.fullName !== 'Valued Member') return info.fullName;
  if (info.firstName && info.firstName !== 'Valued Member') return info.firstName;
  if (info.name && info.name !== 'Valued Member') return info.name;
  if (info.username && info.username !== 'Valued Member') return info.username;
  if (info.email) {
    const emailName = info.email.split('@')[0];
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }
  return null;
}, []);

// 2) Local state that drives the UI
const [displayName, setDisplayName] = useState<string | null>(null);
const [authLoading, setAuthLoading] = useState<boolean>(true);

// 3) Ensure we have fresh user info once, then keep it in sync
useEffect(() => {
  let active = true;

  (async () => {
    // If nothing useful yet, hydrate from token
    if (!userInfo || Object.values(userInfo).includes('Valued Member')) {
      try {
        await refreshUserInfoFromToken();
      } catch (e) {
        console.warn('[HomeTab] refreshUserInfoFromToken error:', e);
      }
    }

    // Derive name from the (possibly updated) userInfo
    const name = getUserName(userInfo);
    if (active) {
      setDisplayName(name); // can be null – that's fine
      setAuthLoading(false);
    }
  })();

  return () => { active = false; };
}, [userInfo, refreshUserInfoFromToken, getUserName]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Only refresh user info if we detect stale data
  useEffect(() => {
    console.log('[HomeTab] userInfo changed:', userInfo);
    
    if (userInfo && userInfo.fullName === 'Valued Member') {
      console.log('[HomeTab] Detected stale userInfo, refreshing from token...');
      refreshUserInfoFromToken();
    }
  }, [userInfo, refreshUserInfoFromToken]);

  // Refresh function for pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('[HomeTab] Pull-to-refresh triggered');
      
      // Refresh user info from token
      await refreshUserInfoFromToken();
      
      // Refresh cart count
      await loadCartCount();
      
      // You can add more refresh logic here in the future:
      // - Refresh notifications
      // - Refresh featured products
      // - etc.
      
      console.log('[HomeTab] Refresh completed');
    } catch (error) {
      console.error('[HomeTab] Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserInfoFromToken, loadCartCount]);

  return (
    <View style={s.container}>
      <AuroraHeader />

      <ScrollView 
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#C48913"]} // Aurora gold color
            tintColor="#C48913"
          />
        }
      >
        {/* Welcome Message */}
        <View style={s.welcomeContainer}>
          <View style={s.greetingRow}>
            <SilverText style={s.welcomeText}>{getGreeting()}, </SilverText>
            {authLoading ? (
      // tiny shimmer/spinner while name loads
      <ActivityIndicator size="small" color="#C48913" />
    ) : (
      <GoldText style={s.userName}>
        {displayName ?? 'Member'}
      </GoldText>
    )}
          </View>
          <SilverText style={s.welcomeText}>Your Signature Begins Here.</SilverText>
          
          {/* Refresh Indicator */}
          {refreshing && (
            <View style={s.refreshIndicator}>
              <ActivityIndicator size="small" color="#C48913" />
              <Text style={s.refreshText}>Yenileniyor...</Text>
            </View>
          )}
          
          
        </View>

        {/* Home Slider */}
        <HomeSlider />

        {/* Bronze Banner with Countdown */}
        <BronzeBanner onPress={() => router.push('/(tabs)/special-today')} />

        {/* Silver Banner */}
        <IconicBanner onPress={() => router.push('/(tabs)/iconic-selections')} />

        {/* Featured Banner */}
        <View style={{ marginTop: 24 }}>
          <FeaturedBanner onPress={() => router.push('/(tabs)/new-arrivals')} />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed "My Collection" (cart) button */}
      <Link href="/collection" asChild>
        <Pressable style={s.collectionFab} accessibilityLabel="Koleksiyonum">
          <Text style={s.collectionText}>MY COLLECTION</Text>
          {basketCount > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{basketCount > 99 ? '99+' : basketCount}</Text>
            </View>
          )}
        </Pressable>
      </Link>
    </View>
  );
}

// Main Home Tab Component
export default function HomeTab() {
  return <HomeTabContent />;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  content: { padding: 10 },
  welcomeContainer: {
    marginBottom: 4,
    marginTop: 0,
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  welcomeText: {
    fontFamily: "CormorantGaramond_400Regular",
    color: "#C9CDD3",
    fontSize: 26,
    letterSpacing: 0.5,
    marginBottom: 2,
    marginTop: 0,
  },
  userName: {
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#C48913",
    fontSize: 22,
    letterSpacing: 1,
    textTransform: "capitalize",
    marginTop: 0,
    marginBottom: 0,
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
    color: "#C48913",
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
    fontFamily: "Cinzel_400Regular",
    color: "#FFFFFF",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 11,
    width: '100%',
    textAlign: 'center',
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
    fontFamily: "Montserrat_500Medium",
    color: "#0B0B0B",
    fontSize: 12,
  },
  debugButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'center',
  },
  debugButtonText: {
    color: '#0B0B0B',
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 4,
  },
  refreshText: {
    color: '#C48913',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    marginLeft: 8,
  },
});
