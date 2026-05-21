// Profile tab — Apple-style identity hierarchy with floating glass sections
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  Settings,
  BadgeCheck,
  Sparkles,
  Grid3x3,
  Bookmark,
  Calendar,
} from "lucide-react-native";
import { api, User, Post } from "../../src/api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../src/theme";

const TABS = [
  { key: "feed", label: "Feed", Icon: Grid3x3 },
  { key: "saved", label: "Saved", Icon: Bookmark },
  { key: "going", label: "Going", Icon: Calendar },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [me, setMe] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState("feed");

  useEffect(() => {
    (async () => {
      const [u, p] = await Promise.all([api.me(), api.posts("me")]);
      setMe(u);
      setPosts(p);
    })();
  }, []);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header bar */}
      <View style={styles.headerBar}>
        <View style={styles.streakWrap}>
          <BlurView intensity={60} tint="light" style={styles.streak}>
            <Sparkles size={13} color={COLORS.gold} fill={COLORS.gold} />
            <Text style={styles.streakText}>5</Text>
          </BlurView>
        </View>
        <Text style={styles.headerTitle}>My profile</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/settings" as any)}
          testID="open-settings"
          style={styles.settingsShadow}
        >
          <BlurView intensity={60} tint="light" style={styles.settingsBtn}>
            <Settings size={18} color={COLORS.text} strokeWidth={2.2} />
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Avatar + identity */}
      {me && (
        <View style={styles.identity}>
          <View style={styles.avatarShadow}>
            <LinearGradient
              colors={[COLORS.blueLight, COLORS.cream, COLORS.gold]}
              style={styles.avatarRing}
            >
              <Image source={{ uri: me.avatar }} style={styles.avatar} testID="profile-avatar" />
            </LinearGradient>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{me.name}</Text>
            {me.verified && <BadgeCheck size={20} color={COLORS.blue} fill={COLORS.blue} strokeWidth={1.8} />}
          </View>
          <Text style={styles.username}>@{me.username}</Text>
        </View>
      )}

      {/* Stats glass card */}
      {me && (
        <View style={styles.statsShadow}>
          <BlurView intensity={60} tint="light" style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatK(me.followers)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{me.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </BlurView>
        </View>
      )}

      {/* Bio glass card */}
      {me && (
        <View style={styles.bioShadow}>
          <BlurView intensity={50} tint="light" style={styles.bioCard}>
            <Text style={styles.bio}>{me.bio}</Text>
          </BlurView>
        </View>
      )}

      {/* CTA Row */}
      <View style={styles.ctaRow}>
        <TouchableOpacity style={styles.ctaPrimary} activeOpacity={0.85}>
          <Text style={styles.ctaPrimaryLabel}>Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaSecondaryShadow} activeOpacity={0.85}>
          <BlurView intensity={50} tint="light" style={styles.ctaSecondary}>
            <Text style={styles.ctaSecondaryLabel}>Share</Text>
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Segmented tabs */}
      <View style={styles.segmentShadow}>
        <BlurView intensity={60} tint="light" style={styles.segment}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                testID={`segment-${t.key}`}
                style={[styles.segItem, active && styles.segItemActive]}
                activeOpacity={0.85}
                onPress={() => setTab(t.key)}
              >
                <t.Icon size={14} color={active ? "#FFF" : COLORS.text} strokeWidth={2.2} />
                <Text style={[styles.segLabel, active && styles.segLabelActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </View>

      {/* Posts grid */}
      <View style={styles.grid}>
        {posts.map((p, i) => (
          <TouchableOpacity
            key={p.id}
            activeOpacity={0.92}
            style={[styles.gridItem, i % 3 !== 2 && { marginRight: 8 }]}
          >
            <Image source={{ uri: p.image }} style={styles.gridImg} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function formatK(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

const GRID_GAP = 8;
const NUM_COLS = 3;

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  streakWrap: { ...SHADOWS.sm, borderRadius: RADII.pill },
  streak: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  streakText: { fontWeight: "700", fontSize: 13, color: COLORS.text },
  headerTitle: { ...TYPE.h2, fontSize: 18 },
  settingsShadow: { ...SHADOWS.sm, borderRadius: 22 },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },

  identity: { alignItems: "center", paddingVertical: SPACING.md },
  avatarShadow: { ...SHADOWS.md, borderRadius: 80 },
  avatarRing: {
    width: 124,
    height: 124,
    borderRadius: 62,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  avatar: { width: 116, height: 116, borderRadius: 58, borderWidth: 3, borderColor: "#FFF" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: SPACING.md },
  name: { ...TYPE.h1, fontSize: 24 },
  username: { ...TYPE.small, marginTop: 2 },

  statsShadow: { ...SHADOWS.md, marginHorizontal: SPACING.lg, marginTop: SPACING.lg, borderRadius: RADII.xl },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: RADII.xl,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 20, fontWeight: "700", color: COLORS.text, letterSpacing: -0.4 },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: "500" },
  statDivider: { width: 1, height: 32, backgroundColor: "rgba(20,40,80,0.08)" },

  bioShadow: { ...SHADOWS.sm, marginHorizontal: SPACING.lg, marginTop: SPACING.md, borderRadius: RADII.lg },
  bioCard: {
    padding: 14,
    borderRadius: RADII.lg,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  bio: { ...TYPE.body, lineHeight: 22 },

  ctaRow: { flexDirection: "row", paddingHorizontal: SPACING.lg, marginTop: SPACING.md, gap: 10 },
  ctaPrimary: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    ...SHADOWS.glow,
  },
  ctaPrimaryLabel: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  ctaSecondaryShadow: { flex: 1, ...SHADOWS.sm, borderRadius: RADII.pill },
  ctaSecondary: {
    paddingVertical: 12,
    borderRadius: RADII.pill,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  ctaSecondaryLabel: { color: COLORS.text, fontWeight: "700", fontSize: 14 },

  segmentShadow: { ...SHADOWS.sm, marginHorizontal: SPACING.lg, marginTop: SPACING.xl, borderRadius: RADII.pill },
  segment: {
    flexDirection: "row",
    padding: 4,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  segItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADII.pill,
  },
  segItemActive: {
    backgroundColor: COLORS.text,
    ...SHADOWS.md,
  },
  segLabel: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  segLabelActive: { color: "#FFF" },

  grid: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: `${100 / NUM_COLS - 2.5}%`,
    aspectRatio: 1,
    borderRadius: RADII.md,
    marginBottom: GRID_GAP,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  gridImg: { width: "100%", height: "100%" },
});
