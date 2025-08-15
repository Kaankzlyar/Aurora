import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, StyleSheet, TextStyle, View } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  children: string;
  style?: StyleProp<TextStyle>;
};

// 1) Statik premium altın degrade
export function GoldText({ children, style }: Props) {
  // Altın paleti: highlight → mid → shadow
  const GOLD = ["#FFF2C4", "#F1D37A", "#D4AF37", "#B8870B", "#8E6A13"] as const;
  return (
    <MaskedView maskElement={<Animated.Text style={style}>{children}</Animated.Text>}>
      <LinearGradient
        colors={GOLD}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: "100%", height: "100%" }}
      />
    </MaskedView>
  );
}

// 2) Shimmer’lı (parlama animasyonlu) altın metin
export function ShimmerGoldText({ children, style }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100], // mask içinde sağa kayan parlama
  });

  return (
    <MaskedView maskElement={<Animated.Text style={style}>{children}</Animated.Text>}>
      {/* Altın temel degrade */}
      <LinearGradient
        colors={["#F8E7AE", "#E9C96A", "#D4AF37", "#B8870B", "#8E6A13"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: "100%", height: "100%" }}
      />
      {/* İnce beyazımsı parlama şeridi */}
      <Animated.View
        pointerEvents="none"
        style={{
          ...StyleSheet.absoluteFillObject as any,
          transform: [{ translateX }],
          opacity: 0.55,
        }}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.85)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: "40%", height: "100%" }}
        />
      </Animated.View>
    </MaskedView>
  );
}
