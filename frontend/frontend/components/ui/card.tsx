// components/ui/card.tsx
import React from "react";
import { View, Text, StyleSheet, ViewProps, TextProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string; // Keep for compatibility
}

interface CardTextProps extends TextProps {
  children: React.ReactNode;
  className?: string; // Keep for compatibility
}

export function Card({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

export function CardHeader({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.cardHeader, style]} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ children, style, ...props }: CardTextProps) {
  return (
    <Text style={[styles.cardTitle, style]} {...props}>
      {children}
    </Text>
  );
}

export function CardDescription({ children, style, ...props }: CardTextProps) {
  return (
    <Text style={[styles.cardDescription, style]} {...props}>
      {children}
    </Text>
  );
}

export function CardContent({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.cardContent, style]} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.cardFooter, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(115, 115, 115, 0.5)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: 20,
    paddingBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#e5e5e5",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#9ca3af",
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardFooter: {
    padding: 20,
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },
});
