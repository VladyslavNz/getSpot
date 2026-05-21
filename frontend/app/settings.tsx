// Settings screen
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import {
  ChevronLeft,
  Bell,
  Sliders,
  Moon,
  Languages,
  Users,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../src/theme";
import { api, User } from "../src/api";

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pauseNotif, setPauseNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [me, setMe] = useState<User | null>(null);

  useEffect(() => {
    api.me().then(setMe).catch(() => {});
  }, []);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconShadow} testID="settings-back">
          <BlurView intensity={60} tint="light" style={styles.iconBtn}>
            <ChevronLeft size={20} color={COLORS.text} strokeWidth={2.4} />
          </BlurView>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* User card */}
      {me && (
        <TouchableOpacity activeOpacity={0.9} style={styles.userShadow}>
          <BlurView intensity={60} tint="light" style={styles.userCard}>
            <Image source={{ uri: me.avatar }} style={styles.userAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{me.name}</Text>
              <Text style={styles.userHandle}>@{me.username}</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textSecondary} />
          </BlurView>
        </TouchableOpacity>
      )}

      {/* Preferences card */}
      <View style={styles.groupShadow}>
        <BlurView intensity={50} tint="light" style={styles.group}>
          <Row
            Icon={Bell}
            label="Pause notifications"
            right={<Switch value={pauseNotif} onValueChange={setPauseNotif} thumbColor="#FFF" trackColor={{ true: COLORS.blue, false: "#D1D1D6" }} />}
          />
          <Divider />
          <Row Icon={Sliders} label="General settings" hasChevron />
          <Divider />
          <Row
            Icon={Moon}
            label="Dark mode"
            right={<Switch value={darkMode} onValueChange={setDarkMode} thumbColor="#FFF" trackColor={{ true: COLORS.blue, false: "#D1D1D6" }} />}
          />
          <Divider />
          <Row Icon={Languages} label="Language" hasChevron rightText="English" />
          <Divider />
          <Row Icon={Users} label="My contacts" hasChevron />
        </BlurView>
      </View>

      {/* Help card */}
      <View style={styles.groupShadow}>
        <BlurView intensity={50} tint="light" style={styles.group}>
          <Row Icon={HelpCircle} label="FAQ" hasChevron />
          <Divider />
          <Row Icon={FileText} label="Terms of service" hasChevron />
          <Divider />
          <Row Icon={Shield} label="User policy" hasChevron />
        </BlurView>
      </View>

      {/* Logout */}
      <TouchableOpacity activeOpacity={0.85} style={styles.logoutShadow} testID="logout-btn">
        <View style={styles.logoutBtn}>
          <LogOut size={18} color={COLORS.danger} strokeWidth={2.2} />
          <Text style={styles.logoutLabel}>Log Out</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.version}>GetSpot · v1.0.0</Text>
    </ScrollView>
  );
}

function Row({ Icon, label, hasChevron, right, rightText }: any) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Icon size={18} color={COLORS.text} strokeWidth={2} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {rightText && <Text style={styles.rowRightText}>{rightText}</Text>}
      {right ? right : hasChevron ? <ChevronRight size={18} color={COLORS.textTertiary} /> : null}
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  iconShadow: { ...SHADOWS.sm, borderRadius: 22 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1, borderColor: COLORS.glassBorder, overflow: "hidden",
  },
  title: { ...TYPE.h2, fontSize: 19 },

  userShadow: { ...SHADOWS.md, marginHorizontal: SPACING.lg, borderRadius: RADII.lg, marginBottom: SPACING.lg },
  userCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: RADII.lg,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1, borderColor: COLORS.glassBorder, overflow: "hidden",
  },
  userAvatar: { width: 52, height: 52, borderRadius: 26 },
  userName: { ...TYPE.h3, fontSize: 16 },
  userHandle: { ...TYPE.small, marginTop: 2 },

  groupShadow: { ...SHADOWS.sm, marginHorizontal: SPACING.lg, borderRadius: RADII.lg, marginBottom: SPACING.lg },
  group: {
    borderRadius: RADII.lg,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1, borderColor: COLORS.glassBorder, overflow: "hidden",
  },
  row: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 14, gap: 12,
  },
  rowIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "rgba(109,148,197,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  rowLabel: { ...TYPE.bodyMed, fontSize: 14, flex: 1 },
  rowRightText: { ...TYPE.small, marginRight: 4 },
  divider: { height: 1, backgroundColor: "rgba(20,40,80,0.06)", marginLeft: 58 },

  logoutShadow: { ...SHADOWS.md, marginHorizontal: SPACING.lg, borderRadius: RADII.pill, marginTop: 8 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 16, borderRadius: RADII.pill,
    backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  logoutLabel: { color: COLORS.danger, fontWeight: "700", fontSize: 14 },
  version: { textAlign: "center", color: COLORS.textTertiary, fontSize: 11, marginTop: 18 },
});
