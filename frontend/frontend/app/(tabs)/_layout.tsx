import { Tabs } from "expo-router";
import { Text } from "react-native";
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0B0B0B",
          borderTopWidth: 0, // Üstteki çizgiyi kaldırıyoruz
        },
        tabBarActiveTintColor: "#D4AF37",
        tabBarInactiveTintColor: "#666666",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color}) => (
             <MaterialDesignIcons name="home-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Keşfet",
          tabBarIcon: ({ color }) => (
            <MaterialDesignIcons name="magnify" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "Sepetim",
          tabBarIcon: ({ color }) => (
            <MaterialDesignIcons name="shopping-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <MaterialDesignIcons name="account-circle" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
