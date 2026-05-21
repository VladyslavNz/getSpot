// Full "Who's going" attendees list screen
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
import { ChevronLeft, BadgeCheck, Crown, Search } from "lucide-react-native";
import { api, Event } from "../../../src/api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../../src/theme";

// Fallback names (deterministic) for seeded attendee avatars
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

  // Build attendee list: organizer first, then participants from event.attendees.
  // Synthesize a few extra rows to match member_count for the demo (cosmetic only).
  const synthesized = Math.max(0, event.member_count - event.attendees.length);
  const filler = Array.from({ length: synthesized }).map((_, i) => ({
    avatar: event.attendees[i % event.attendees.length] || event.host_avatar,
    name: DEMO_NAMES[i % DEMO_NAMES.length],
  }));
  const allParticipants = [
    ...event.attendees.map((a, i) => ({ avatar: a, name: DEMO_NAMES[i % DEMO_NAMES.length] })),
    ...filler,
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Sticky header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <BlurView intensity={70} tint="light" style={styles.headerBlur}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="attendees-back">
            <ChevronLeft size={22} color={COLORS.text} strokeWidth={2.4} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Who's going</Text>
            <Text style={styles.headerSub} numberOfLines={1}>{event.title}</Text>
          </View>
          <View style={styles.countPill}>
            <Text style={styles.countText}>{event.member_count}</Text>
          </View>
        </BlurView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 78, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Organizer section */}
        <Text style={styles.sectionLabel}>Organizer</Text>
        <TouchableOpacity activeOpacity={0.92} style={styles.personShadow}>
          <View style={[styles.personCard, styles.organizerCard]}>
            <View style={styles.organizerRing}>
              <Image source={{ uri: event.host_avatar }} style={styles.personAvatar} />
              <View style={styles.crownBadge}>
                <Crown size={11} color="#FFF" fill="#FFF" strokeWidth={2} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Text style={styles.personName}>{event.host_name}</Text>
                <BadgeCheck size={14} color={COLORS.blue} fill={COLORS.blue} />
              </View>
              <Text style={styles.organizerRole}>Host · {event.category}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.85} style={styles.contactBtn}>
              <Text style={styles.contactLabel}>Contact</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Participants section */}
        <View style={styles.participantsHeader}>
          <Text style={styles.sectionLabel}>Participants</Text>
          <Text style={styles.countSmall}>{allParticipants.length}</Text>
        </View>

        <View style={styles.participantsList}>
          {allParticipants.map((p, i) => (
            <TouchableOpacity
              key={i}
              testID={`attendee-${i}`}
              activeOpacity={0.85}
              style={styles.personShadow}
            >
              <View style={styles.personCard}>
                <Image source={{ uri: p.avatar }} style={styles.personAvatar} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
  },
  headerBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,40,80,0.04)",
  },
  headerCenter: { flex: 1 },
  headerTitle: { ...TYPE.h3, fontSize: 17 },
  headerSub: { ...TYPE.small, fontSize: 12, marginTop: 1 },
  countPill: {
    minWidth: 36,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    backgroundColor: COLORS.text,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: { color: "#FFF", fontWeight: "700", fontSize: 13 },

  sectionLabel: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.6,
    marginHorizontal: SPACING.lg,
    marginBottom: 10,
    marginTop: 6,
  },
  countSmall: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.text,
    backgroundColor: "rgba(20,40,80,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: SPACING.lg,
  },
  participantsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
  },
  participantsList: { gap: 8 },

  personShadow: { ...SHADOWS.sm, marginHorizontal: SPACING.lg, borderRadius: RADII.lg, marginBottom: 8 },
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADII.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  organizerCard: {
    backgroundColor: "rgba(109,148,197,0.08)",
    borderColor: "rgba(109,148,197,0.28)",
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
