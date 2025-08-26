import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import GoldText from "./GoldText";

export default function AuroraHeader() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleProfilePress = () => {
    console.log("[AuroraHeader] Profile button pressed!");
    setShowProfileMenu(true);
  };

  const navigateToProfile = () => {
    console.log("[AuroraHeader] Navigating to profile...");
    setShowProfileMenu(false);
    router.push("/(tabs)/profile");
  };

  const navigateToCart = () => {
    console.log("[AuroraHeader] Navigating to cart...");
    setShowProfileMenu(false);
    router.push("/(tabs)/collection");
  };

  return (
    <>
      <SafeAreaView style={s.safeArea}>
        <View style={s.container}>
          <GoldText style={s.brand}>AURORA</GoldText>
          <Pressable
            hitSlop={12}
            style={s.profileBtn}
            accessibilityLabel="Profil"
            onPress={handleProfilePress}
          >
            <Ionicons name="menu" size={26} color="#C48913" />
          </Pressable>
        </View>
      </SafeAreaView>

      <Modal
        visible={showProfileMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <Pressable 
          style={s.modalOverlay} 
          onPress={() => setShowProfileMenu(false)}
        >
          <View style={s.profileMenu}>
            <Pressable style={s.menuItem} onPress={navigateToProfile}>
              <Text style={s.menuIcon}>👤</Text>
              <Text style={s.menuText}>Hesap Bilgileri</Text>
            </Pressable>
            
            <View style={s.menuDivider} />
            
            <Pressable style={s.menuItem} onPress={() => {
              setShowProfileMenu(false);
              router.push("/orders");
            }}>
              <Text style={s.menuIcon}>📋</Text>
              <Text style={s.menuText}>Siparişlerim</Text>
            </Pressable>
            
            <View style={s.menuDivider} />
            
            <Pressable style={s.menuItem} onPress={navigateToCart}>
              <Ionicons name="bag-outline" size={20} color={"#D4AF37"} />
              <Text style={s.menuText}>Sepetim</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  safeArea: {
    backgroundColor: "#0B0B0B",
  },
  container: {
    height: 50, // Changed from 60 to 50 for more compact header
    backgroundColor: "#0B0B0B",
    // Removed the gray border line
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    width: '100%',
  },
  brand: {
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#C48913",
    fontSize: 25,
    marginTop: 8, // Adjusted from 11.2 to 8 for better centering in reduced height
    width: '100%',
    flexWrap: 'wrap',
  },
  profileBtn: { 
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 16,
  },
  profileMenu: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
    minWidth: 200,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  menuText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    flex: 1,
    flexWrap: 'wrap',
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#333333",
    marginHorizontal: 10,
  },
});