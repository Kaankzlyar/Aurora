import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import AuroraHeader from "../../components/AuroraHeader";

export default function Screen() {
  return (
    <View style={styles.container}>
      <AuroraHeader />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>👤 Hesap Bilgileri</Text>
          <Text style={styles.subtitle}>Profil ve ayarlarınız</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ad Soyad</Text>
            <Text style={styles.infoValue}>Kullanıcı Adı</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>E-posta</Text>
            <Text style={styles.infoValue}>kullanici@example.com</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Telefon</Text>
            <Text style={styles.infoValue}>+90 555 123 45 67</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap İşlemleri</Text>
          
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Siparişlerim</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionIcon}>❤️</Text>
            <Text style={styles.actionText}>Favorilerim</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Ayarlar</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionIcon}>🚪</Text>
            <Text style={styles.actionText}>Çıkış Yap</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#D4AF37",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_600SemiBold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  infoItem: {
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: "Montserrat_500Medium",
    color: "#FFFFFF",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: "center",
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    color: "#FFFFFF",
  },
  actionArrow: {
    fontSize: 20,
    color: "#D4AF37",
    fontFamily: "Montserrat_400Regular",
  },
});