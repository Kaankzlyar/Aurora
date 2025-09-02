import React from "react";
import { Text, StyleSheet, TextProps, Platform } from "react-native";
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from "expo-linear-gradient";

export default function GoldText({ children, style, ...props }: TextProps) {
  const GOLD = ["#f6e5a2ff", "#F1D37A", "#C48913", "#b1820dff"] as const;
  
  // Use simple gold text on web or if MaskedView is not available
  if (Platform.OS === 'web') {
    return (
      <Text style={[styles.text, styles.fallbackGold, style]} {...props}>
        {children}
      </Text>
    );
  }
  
  // Try gradient text for mobile
  return (
    <MaskedView maskElement={<Text style={[styles.text, style]} {...props}>{children}</Text>}>
      <LinearGradient
        colors={GOLD}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <Text style={[styles.text, style, { opacity: 0 }]} {...props}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    letterSpacing: 1,
    color: '#C48913', // fallback gold color
  },
  fallbackGold: {
    color: '#D4AF37',
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});