// Custom floating glassmorphism tab bar with center FAB
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";
import { Map, Compass, MessageCircle, User, Plus } from "lucide-react-native";
import { COLORS, RADII, SHADOWS, SPACING } from "../theme";

type TabDef = { key: string; label: string; href: string; Icon: any };

const TABS_LEFT: TabDef[] = [
  { key: "map", label: "Map", href: "/(tabs)/map", Icon: Map },
  { key: "discover", label: "Discover", href: "/(tabs)/discover", Icon: Compass },
];
const TABS_RIGHT: TabDef[] = [
  { key: "chats", label: "Chats", href: "/(tabs)/chats", Icon: MessageCircle },
  { key: "profile", label: "Profile", href: "/(tabs)/profile", Icon: User },
];

export default function FloatingTabBar() {
  const router = useRouter();
  const pathname = usePathname() || "";
  const insets = useSafeAreaInsets();

  const isActive = (href: string) => {
    const seg = href.split("/").pop() || "";
    return pathname.includes(seg);
  };

  const renderTab = (t: TabDef) => {
    const active = isActive(t.href);
    return (
      <TouchableOpacity
        key={t.key}
        testID={`tab-${t.key}`}
        style={styles.tab}
        activeOpacity={0.7}
        onPress={() => router.push(t.href as any)}
      >
        <t.Icon
          size={22}
          color={active ? COLORS.blue : COLORS.textSecondary}
          strokeWidth={active ? 2.4 : 2}
        />
        <Text style={[styles.label, active && styles.labelActive]}>{t.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.row}>
        <View style={styles.barShadow}>
          <BlurView intensity={70} tint="light" style={styles.bar}>
            <View style={styles.barInner}>
              {TABS_LEFT.map(renderTab)}
              <View style={styles.spacer} />
              {TABS_RIGHT.map(renderTab)}
            </View>
          </BlurView>
        </View>

        <TouchableOpacity
          testID="tab-create"
          activeOpacity={0.85}
          onPress={() => router.push("/create")}
          style={styles.fabWrap}
        >
          <View style={styles.fabGlow}>
            <View style={styles.fab}>
              <Plus size={26} color="#FFFFFF" strokeWidth={2.6} />
            </View>
          </View>
        </TouchableOpacity>
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
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
  },
  row: { width: "100%", alignItems: "center", justifyContent: "center" },
  barShadow: {
    ...SHADOWS.lg,
    borderRadius: RADII.pill,
    width: "100%",
  },
  bar: {
    borderRadius: RADII.pill,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  barInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 56,
  },
  label: { fontSize: 10, fontWeight: "500", color: COLORS.textSecondary, marginTop: 3, letterSpacing: 0.1 },
  labelActive: { color: COLORS.blue, fontWeight: "600" },
  spacer: { width: 60 },
  fabWrap: {
    position: "absolute",
    top: -22,
    alignSelf: "center",
  },
  fabGlow: {
    ...SHADOWS.glow,
    borderRadius: RADII.pill,
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({ ios: { shadowColor: COLORS.blue, shadowOpacity: 0.5, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } } }),
  },
});
