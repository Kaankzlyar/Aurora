// components/ui/label.tsx
import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";

interface LabelProps extends TextProps {
  children: React.ReactNode;
  htmlFor?: string; // Keep for compatibility but not used in RN
}

export function Label({ children, style, ...props }: LabelProps) {
  return (
    <Text style={[styles.label, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#e5e5e5", // Light color for dark theme
    marginBottom: 4,
  },
});
