// Who's going — fixed glass header + organizer, only list scrolls
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, BadgeCheck, Crown } from "lucide-react-native";
import { api, Event } from "../../../src/api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../../src/theme";

const DEMO_NAMES = [
  "Ulyana Tarakovskaya",
  "Mateo Rivera",
  "Hana Suzuki",
  "Liam O'Connor",
  "Aiyana Lopez",
  "Noor Hassan",
  "Theo Petersen",
  "Zara Khan",
  "Felix Bauer",
  "Inès Laurent",
  "Sebastián Cruz",
  "Mira Patel",
];

export default function Attendees() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (id) api.event(id).then(setEvent).catch(() => {});
  }, [id]);

  if (!event) return <View style={{ flex: 1, backgroundColor: COLORS.bg }} />;

  const synthesized = Math.max(0, event.member_count - event.attendees.length);
  const filler = Array.from({ length: synthesized }).map((_, i) => ({
    avatar: event.attendees[i % event.attendees.length] || event.host_avatar,
    name: DEMO_NAMES[i % DEMO_NAMES.length],
  }));
  const allParticipants = [
    ...event.attendees.map((a, i) => ({
      avatar: a,
      name: DEMO_NAMES[i % DEMO_NAMES.length],
    })),
    ...filler,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Atmospheric gradient background */}
      <LinearGradient
        colors={[COLORS.cream, "#FBF7F0", COLORS.blueLight]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* FIXED top zone — header + organizer */}
      <View style={[styles.fixedZone, { paddingTop: insets.top + 4 }]}>
        {/* Transparent glass header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            testID="attendees-back"
            activeOpacity={0.85}
          >
            <BlurView intensity={50} tint="light" style={styles.backBlur}>
              <ChevronLeft size={20} color={COLORS.text} strokeWidth={2.4} />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>{"Who's going"}</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {event.title}
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Organizer (fixed) — same card style as participants */}
        <Text style={styles.sectionLabel}>Organizer</Text>
        <TouchableOpacity activeOpacity={0.92} style={styles.personShadow}>
          <View style={styles.personCard}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: event.host_avatar }} style={styles.personAvatar} />
              <View style={styles.crownBadge}>
                <Crown size={9} color="#FFF" fill="#FFF" strokeWidth={2} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Text style={styles.personName}>{event.host_name}</Text>
                <BadgeCheck size={13} color={COLORS.blue} fill={COLORS.blue} />
              </View>
              <Text style={styles.personMeta}>Organizer · {event.category}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.85} style={styles.contactBtn} testID="contact-host">
              <Text style={styles.contactLabel}>Contact</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Participants header (fixed) — pulled higher with extra top room */}
        <View style={styles.participantsHeader}>
          <Text style={styles.sectionLabel}>Participants</Text>
          <View style={styles.smallCount}>
            <Text style={styles.smallCountText}>{allParticipants.length}</Text>
          </View>
        </View>
      </View>

      {/* Top fade edge over scrolling content */}
      <LinearGradient
        colors={["rgba(245,239,230,0.95)", "rgba(245,239,230,0)"]}
        pointerEvents="none"
        style={[styles.fadeTop, { top: insets.top + 206 }]}
      />

      {/* SCROLLABLE participants list only */}
      <ScrollView
        style={[styles.scroll, { marginTop: insets.top + 206 }]}
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <View style={styles.participantsList}>
          {allParticipants.map((p, i) => (
            <TouchableOpacity
              key={i}
              testID={`attendee-${i}`}
              activeOpacity={0.85}
              style={styles.personShadow}
            >
              <View style={styles.personCard}>
                <View style={styles.avatarWrap}>
                  <Image source={{ uri: p.avatar }} style={styles.personAvatar} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.personName}>{p.name}</Text>
                  <Text style={styles.personMeta}>Joined the event</Text>
                </View>
                <View style={styles.followChip}>
                  <Text style={styles.followLabel}>Follow</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom fade edge */}
      <LinearGradient
        colors={["rgba(203,220,235,0)", "rgba(203,220,235,0.9)"]}
        pointerEvents="none"
        style={[styles.fadeBottom, { height: insets.bottom + 32 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fixedZone: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 0,
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    gap: 12,
    paddingTop: 4,
    paddingBottom: 14,
  },
  backBtn: { borderRadius: 20 },
  backBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { ...TYPE.h2, fontSize: 22, letterSpacing: -0.4 },
  headerSub: { ...TYPE.small, fontSize: 12, marginTop: 1 },
  countPill: {
    minWidth: 40,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 12,
    backgroundColor: COLORS.text,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  countText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  headerSpacer: { width: 40, height: 40 },

  sectionLabel: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.6,
    marginHorizontal: SPACING.lg,
    marginBottom: 8,
  },
  participantsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: SPACING.lg,
    marginTop: 10,
    marginBottom: 6,
  },
  smallCount: {
    backgroundColor: "rgba(20,40,80,0.06)",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  smallCountText: { fontSize: 11, fontWeight: "700", color: COLORS.text },

  fadeTop: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 14,
    zIndex: 5,
  },
  fadeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },

  scroll: { flex: 1 },
  participantsList: { gap: 8 },

  personShadow: {
    ...SHADOWS.sm,
    marginHorizontal: SPACING.lg,
    borderRadius: RADII.lg,
    marginBottom: 8,
  },
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADII.lg,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  organizerCard: {
    backgroundColor: "rgba(109,148,197,0.10)",
    borderColor: "rgba(109,148,197,0.30)",
    marginHorizontal: SPACING.lg,
    marginBottom: 14,
  },
  organizerRing: { position: "relative" },
  personAvatar: { width: 46, height: 46, borderRadius: 23 },
  crownBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  personName: { ...TYPE.bodyMed, fontSize: 15 },
  personMeta: { ...TYPE.small, fontSize: 12, marginTop: 1 },
  organizerRole: { fontSize: 12, color: COLORS.blue, fontWeight: "600", marginTop: 2 },

  contactBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.text,
  },
  contactLabel: { color: "#FFF", fontWeight: "700", fontSize: 12 },

  followChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(20,40,80,0.05)",
  },
  followLabel: { color: COLORS.text, fontWeight: "700", fontSize: 12 },
});
