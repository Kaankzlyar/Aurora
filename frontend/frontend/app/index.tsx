// app/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Wait a bit to ensure the router is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const token = await AsyncStorage.getItem("token");
        
        if (token) {
          // User is authenticated, go to home
          router.replace("/home");
        } else {
          // User is not authenticated, go to login
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        router.replace("/login");
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  // This should not be reached as we navigate away
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#585858ff",
  },
});
