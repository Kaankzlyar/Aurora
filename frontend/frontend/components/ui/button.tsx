// components/ui/button.tsx

import React from "react";
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/build/Ionicons';

type ButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: "default" | "outline" | "destructive";
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
};

export function Button({ title, onPress, variant = "default", disabled, icon, iconSize = 20 }: ButtonProps) {
  if (variant === "default") {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.button, disabled && styles.disabled]}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <LinearGradient
          colors={['#D4AF37', '#C48913', '#B8860B']}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.buttonContent}>
            {icon && (
              <Ionicons name={icon} size={iconSize} color="#0B0B0B" style={styles.buttonIcon} />
            )}
            <Text style={styles.gradientText}>{title}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, variantStyles[variant], disabled && styles.disabled]}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.buttonContent}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={iconSize} 
            color={variantTextStyles[variant].color} 
            style={styles.buttonIcon} 
          />
        )}
        <Text style={[styles.text, variantTextStyles[variant]]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  gradientText: {
    color: '#0B0B0B',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = {
  default: {
    backgroundColor: "transparent", // Gradient kullanılacak
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#C48913",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  destructive: {
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
};

const variantTextStyles = {
  default: {
    color: "#0B0B0B",
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
  },
  outline: {
    color: "#D4AF37",
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
  },
  destructive: {
    color: "#fff",
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
  },
};
