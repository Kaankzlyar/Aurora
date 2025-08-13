import { View, Text, Pressable, StyleSheet } from "react-native";

export default function AuroraHeader() {
  return (
    <View style={s.container}>
      <Text style={s.brand}>AURORA</Text>
      <Pressable hitSlop={12} style={s.profileBtn} accessibilityLabel="Profil">
        <Text style={s.profileEmoji}>👤</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: "#0B0B0B",
    borderBottomColor: "#1A1A1A",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    position: "absolute",
    left: 16,
    fontFamily: "PlayfairDisplay-Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#D4AF37",
    fontSize: 20,
  },
  profileBtn: { position: "absolute", right: 12, padding: 6 },
  profileEmoji: { fontSize: 22 },
});