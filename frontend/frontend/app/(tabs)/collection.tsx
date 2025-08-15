import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import AuroraHeader from "../../components/AuroraHeader";

export default function Screen() {
  return (
    <View style={styles.container}>
      <AuroraHeader />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🛍️ Koleksiyonum</Text>
          <Text style={styles.subtitle}>Seçtiğiniz ürünler</Text>
        </View>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Sepetiniz Boş</Text>
          <Text style={styles.emptyDescription}>
            Henüz sepetinize ürün eklemediniz.{'\n'}
            Alışverişe başlamak için ürünleri keşfedin.
          </Text>
          <Pressable style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Alışverişe Başla</Text>
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
    color: "#C48913",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "PlayfairDisplay_600SemiBold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
    color: "#000000",
    textAlign: "center",
  },
});