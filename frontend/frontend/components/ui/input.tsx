// components/ui/input.tsx
import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  id?: string; // Keep for compatibility
  type?: string; // Keep for compatibility - will map to secureTextEntry
}

export function Input({ type, style, ...props }: InputProps) {
  const secureTextEntry = type === "password";
  
  return (
    <TextInput
      style={[styles.input, style]}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#e5e5e5",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
});
