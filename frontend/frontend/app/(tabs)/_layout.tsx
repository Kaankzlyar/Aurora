<<<<<<< HEAD
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="collection" options={{ title: "Koleksiyonum" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
=======
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size || 24, color }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size || 24, color }}>🔍</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size || 24, color }}>👤</Text>
          ),
        }}
      />
>>>>>>> 6e5bc13e524bf6c95a46101914a8d33bf539a831
    </Tabs>
  );
}
