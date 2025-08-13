// components/ui/button.tsx

import React from "react";
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from "react-native";

type ButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: "default" | "outline" | "destructive";
  disabled?: boolean;
};

export function Button({ title, onPress, variant = "default", disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, variantStyles[variant], disabled && styles.disabled]}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={[styles.text, variantTextStyles[variant]]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = {
  default: {
    backgroundColor: "#D4AF37", // Amber
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  destructive: {
    backgroundColor: "#ef4444", // Red
  },
};

const variantTextStyles = {
  default: {
    color: "#000",
  },
  outline: {
    color: "#facc15",
  },
  destructive: {
    color: "#fff",
  },
};
