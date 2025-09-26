import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface GoldenButtonProps {
  onPress: () => void;
  title: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  size?: 'small' | 'medium' | 'large';
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const GoldenButton: React.FC<GoldenButtonProps> = ({
  onPress,
  title,
  iconName,
  iconSize = 20,
  size = 'medium',
  buttonStyle,
  textStyle,
  disabled = false,
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          fontSize: 14,
        };
      case 'large':
        return {
          paddingHorizontal: 32,
          paddingVertical: 16,
          fontSize: 18,
        };
      case 'medium':
      default:
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          fontSize: 16,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <LinearGradient
        colors={['#D4AF37', '#C48913', '#B8860B']}
        style={[styles.button, { paddingHorizontal: sizeStyles.paddingHorizontal, paddingVertical: sizeStyles.paddingVertical }, buttonStyle]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {iconName && (
          <Ionicons name={iconName} size={iconSize} color="#000000" />
        )}
        {title ? (
          <Text style={[styles.buttonText, { fontSize: sizeStyles.fontSize }, textStyle]}>{title}</Text>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
});