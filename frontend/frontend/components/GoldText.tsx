import React from "react";
import { TextStyle } from "react-native";
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
  const GOLD = ["#FFF5CC", "#F1D37A", "#D4AF37", "#B8870B"] as const;
  return (
    <MaskedView maskElement={<Text style={style}>{children}</Text>}>
      <LinearGradient
        colors={GOLD}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      />
    </MaskedView>
  );
}
