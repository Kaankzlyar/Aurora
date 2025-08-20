import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from "expo-linear-gradient";

export default function SilverText({ children, style, ...props }: TextProps) {
  return (
    <MaskedView maskElement={<Text style={[styles.text, style]} {...props}>{children}</Text>}>
      <LinearGradient
        colors={["#a3a4a5ff", "#D6DAE0", "#d4d5d7ff"]}
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
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 18,
    letterSpacing: 1,
    color: "#F3F4F6", // fallback color - daha açık silver
  },
});
