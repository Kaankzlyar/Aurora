import { Tabs } from "expo-router";
import { Text } from "react-native";
import { Ionicons } from '@expo/vector-icons';
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0B0B0B",
          borderTopWidth: 0,
          borderTopColor: "#1A1A1A",
          height: 65, // Sabit yükseklik
          paddingBottom: 8,
          paddingTop: 2,
        },
        tabBarActiveTintColor: "#D4AF37",
        tabBarInactiveTintColor: "#666666",
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Montserrat_500Medium',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color}) => (
             <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoriler",
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "Sepetim",
          tabBarIcon: ({ color }) => (
            <Ionicons name="bag-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
