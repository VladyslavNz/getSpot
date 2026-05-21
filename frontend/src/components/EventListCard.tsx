// Compact list-style event card (matches user's reference design)
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import {
  Calendar,
  MapPin,
  Coffee,
  Globe,
  Bike,
  Briefcase,
  Palette,
  HeartPulse,
  Sparkles,
} from "lucide-react-native";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../theme";
import type { Event } from "../api";

export const TYPE_META: Record<string, { Icon: any; label: string; tint: string }> = {
  cultural: { Icon: Globe, label: "Cultural", tint: "#6D94C5" },
  activity: { Icon: Bike, label: "Activity", tint: "#3FB58B" },
  informal: { Icon: Coffee, label: "Informal", tint: "#C9A24B" },
  professional: { Icon: Briefcase, label: "Professional", tint: "#1C1C1E" },
  creative: { Icon: Palette, label: "Creative", tint: "#E07A8B" },
  health: { Icon: HeartPulse, label: "Health", tint: "#E5604E" },
};

type Props = {
  event: Event;
  onPress?: () => void;
};

export default function EventListCard({ event, onPress }: Props) {
  const meta = TYPE_META[event.event_type] || TYPE_META.informal;
  const TypeIcon = meta.Icon;

  return (
    <TouchableOpacity
      testID={`event-card-${event.id}`}
      activeOpacity={0.92}
      onPress={onPress}
      style={styles.shadow}
    >
      <View style={styles.card}>
        {/* Thumbnail */}
        <View style={styles.thumbWrap}>
          {event.image ? (
            <Image source={{ uri: event.image }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]}>
              <TypeIcon size={26} color={COLORS.textTertiary} strokeWidth={1.6} />
            </View>
          )}
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {event.title}
            </Text>
            <View style={[styles.typeIcon, { backgroundColor: `${meta.tint}14` }]}>
              <TypeIcon size={13} color={meta.tint} strokeWidth={2.2} />
            </View>
          </View>

          <View style={styles.metaRow}>
            <Calendar size={11} color={COLORS.textSecondary} strokeWidth={2} />
            <Text style={styles.metaText} numberOfLines={1}>
              {formatDate(event.date)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <MapPin size={11} color={COLORS.textSecondary} strokeWidth={2} />
            <Text style={styles.metaText} numberOfLines={1}>
              {event.city} · {event.distance_km}km
            </Text>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.hostBlock}>
              <Image source={{ uri: event.host_avatar }} style={styles.hostAvatar} />
              <Text style={styles.hostName} numberOfLines={1}>
                {event.host_name.split(" ")[0]}
              </Text>
              {event.is_premium && (
                <View style={styles.premiumChip}>
                  <Sparkles size={9} color="#FFF" strokeWidth={2.6} />
                </View>
              )}
            </View>

            <View style={styles.capacityBlock}>
              {event.attendees.length > 0 && (
                <View style={styles.attStack}>
                  {event.attendees.slice(0, 2).map((a, i) => (
                    <Image
                      key={i}
                      source={{ uri: a }}
                      style={[styles.attAvatar, { marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }]}
                    />
                  ))}
                </View>
              )}
              <Text style={styles.capacity}>
                {event.capacity === 0
                  ? "Open"
                  : `${event.member_count}/${event.capacity}`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / 86400000);
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    if (diffDays === 0) return `Today · ${time}`;
    if (diffDays === 1) return `Tomorrow · ${time}`;
    if (diffDays === -1) return `Yesterday · ${time}`;
    const day = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    return `${day} · ${time}`;
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  shadow: {
    ...SHADOWS.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADII.lg,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: 10,
    gap: 12,
    minHeight: 120,
  },
  thumbWrap: { width: 96, height: 96, alignSelf: "center" },
  thumb: { width: 96, height: 96, borderRadius: RADII.md, backgroundColor: COLORS.cream },
  thumbFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cream,
    borderWidth: 1,
    borderColor: "rgba(20,40,80,0.06)",
  },
  body: { flex: 1, paddingVertical: 2, justifyContent: "space-between" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { ...TYPE.h3, fontSize: 17, flex: 1, letterSpacing: -0.3 },
  typeIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  metaText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: "500" },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  hostBlock: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  hostAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  hostName: { fontSize: 12, fontWeight: "600", color: COLORS.text, maxWidth: 80 },
  premiumChip: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  capacityBlock: { flexDirection: "row", alignItems: "center", gap: 6 },
  attStack: { flexDirection: "row" },
  attAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  capacity: { fontSize: 12, fontWeight: "600", color: COLORS.text },
});
