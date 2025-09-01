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
          height: 65,
          paddingBottom: 8,
          paddingTop: 2,
          paddingHorizontal: 4,
        },
        tabBarActiveTintColor: "#D4AF37",
        tabBarInactiveTintColor: "#666666",
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Montserrat_500Medium',
          textAlign: 'center',
          flexWrap: 'wrap',
          width: '100%',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color}) => (
             <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Keşfet",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoriler",
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "Sepetim",
          tabBarIcon: ({ color }) => (
            <Ionicons name="bag-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={22} color={color} />
          ),
        }}
      />
      
      {/* Hidden category pages - not visible in tab bar */}
      <Tabs.Screen
        name="special-today"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="iconic-selections"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="new-arrivals"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}