// components/ui/input.tsx
import React, { forwardRef } from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  id?: string; // Keep for compatibility
  type?: string; // Keep for compatibility - will map to secureTextEntry
}

export const Input = forwardRef<TextInput, InputProps>(({ type, style, ...props }, ref) => {
  const secureTextEntry = type === "password" || props.secureTextEntry;
  
  return (
    <TextInput
      ref={ref}
      style={[styles.input, style]}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#9ca3af"
      autoCorrect={false}
      spellCheck={false}
      autoCapitalize="none"
      blurOnSubmit={false}
      returnKeyType="next"
      {...props}
    />
  );
});

Input.displayName = 'Input';

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
    fontFamily: 'Montserrat_400Regular',
  },
});
