import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>Yönlendiriliyor...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#333"
  }
});
