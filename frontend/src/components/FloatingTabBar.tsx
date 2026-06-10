// Docked navigation bar styled to match the design reference
import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";
import { Map, Compass, MessageCircle, User, Plus } from "lucide-react-native";
import { COLORS, RADII, SPACING } from "../theme";

type TabDef = { key: string; label: string; href: string; Icon: any };

const TABS: TabDef[] = [
  { key: "map", label: "Map", href: "/(tabs)/map", Icon: Map },
  { key: "discover", label: "Discover", href: "/(tabs)/discover", Icon: Compass },
  { key: "create", label: "Create", href: "/create", Icon: Plus },
  { key: "chats", label: "Chats", href: "/(tabs)/chats", Icon: MessageCircle },
  { key: "profile", label: "Profile", href: "/(tabs)/profile", Icon: User },
];

export default function FloatingTabBar() {
  const router = useRouter();
  const pathname = usePathname() || "";
  const insets = useSafeAreaInsets();

  const isActive = (href: string) => {
    if (href === "/create") return false;
    const seg = href.split("/").pop() || "";
    return pathname.includes(seg);
  };

  const renderTab = (t: TabDef) => {
    const active = isActive(t.href);
    const activeColor = "#4E6C3B"; // Premium forest green active color from references
    const inactiveColor = "#8A8576"; // Muted warm grey/brown inactive color from references

    return (
      <Pressable
        key={t.key}
        testID={`tab-${t.key}`}
        style={({ pressed }) => [
          styles.tab,
          pressed && { opacity: 0.7 }
        ]}
        onPress={() => router.push(t.href as any)}
      >
        <t.Icon
          size={22}
          color={active ? activeColor : inactiveColor}
          strokeWidth={2}
        />
        <Text style={[styles.label, active && styles.labelActive]}>{t.label}</Text>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingBottom: insets.bottom,
          height: 56 + insets.bottom,
        },
      ]}
    >
      <View style={styles.barInner}>
        {TABS.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F4F3ED", // Solid cream background matching the bottom sheet
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)", // Faint top separator line
    zIndex: 99,
    ...Platform.select({
      ios: {},
      android: { elevation: 20 },
    }),
  },
  barInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 56,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: "#8A8576",
    marginTop: 3,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: "#4E6C3B",
    fontWeight: "600",
  },
});
