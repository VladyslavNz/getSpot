// Tabs layout — uses our custom floating glass tab bar
import { Slot } from "expo-router";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FloatingTabBar from "../../src/components/FloatingTabBar";
import { COLORS } from "../../src/theme";

export default function TabsLayout() {
  return (
    <View style={styles.root}>
      {/* Ambient atmosphere gradient background */}
      <LinearGradient
        colors={[COLORS.cream, "#FBF7F0", COLORS.blueLight]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Slot />
      </View>
      <FloatingTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { flex: 1 },
});
