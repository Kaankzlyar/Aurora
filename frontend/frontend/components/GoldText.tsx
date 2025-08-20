import React from "react";
import { TextStyle, StyleSheet } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native";

export default function GoldText({
  children,
  style,
}: {
  children: string;
  style?: TextStyle;
}) {
  const GOLD = ["#f6e5a2ff", "#F1D37A", "#C48913", "#b1820dff"] as const;
  
  const textStyle = [
    styles.defaultText,
    style
  ];

  return (
    <MaskedView 
      style={{ height: 'auto' }}
      maskElement={
        <Text style={textStyle}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={GOLD}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[{ flex: 1 }, textStyle]}
      >
        <Text style={[textStyle, { opacity: 0 }]}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    letterSpacing: 1,
    color: '#FFFFFF', // fallback color
    marginTop: 6,
    marginBottom: 8,
  },
});