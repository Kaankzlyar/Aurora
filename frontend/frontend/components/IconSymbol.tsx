import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
  weight?: string;
  style?: ViewStyle;
}

export function IconSymbol({ name, size = 16, color = '#000', style }: IconSymbolProps) {
  // Simple fallback for IconSymbol - using Unicode arrows/symbols
  const getSymbol = (iconName: string) => {
    switch (iconName) {
      case 'chevron.right':
        return '▶';
      case 'chevron.left.forwardslash.chevron.right':
        return '</>';
      default:
        return '●';
    }
  };

  return (
    <Text 
      style={[
        styles.icon, 
        { fontSize: size, color },
        style
      ]}
    >
      {getSymbol(name)}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});
