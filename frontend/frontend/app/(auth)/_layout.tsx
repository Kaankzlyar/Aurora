import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 800,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: { backgroundColor: '#000000' },
          animationTypeForReplace: 'push',
          presentation: 'card',
        }}
      >
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            animation: 'fade_from_bottom',
            animationDuration: 1000,
            contentStyle: { backgroundColor: '#000000' },
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 800,
            contentStyle: { backgroundColor: '#000000' },
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="forgot-password" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_bottom',
            animationDuration: 600,
            contentStyle: { backgroundColor: '#000000' },
            presentation: 'modal',
          }} 
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
