// Root layout
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { COLORS } from "../src/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.bg },
            animation: "fade",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="create"
            options={{ presentation: "transparentModal", animation: "fade" }}
          />
          <Stack.Screen name="event/[id]/index" options={{ animation: "slide_from_bottom" }} />
          <Stack.Screen name="event/[id]/attendees" />
          <Stack.Screen name="chat/[id]" options={{ animation: "none" }} />
          <Stack.Screen name="settings" />
          <Stack.Screen name="spots" />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}
