// EventCard — immersive image card with glass info panel
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Sparkles } from "lucide-react-native";
import { COLORS, RADII, SHADOWS, SPACING } from "../theme";
import type { Event } from "../api";

type Props = {
  event: Event;
  onPress?: () => void;
  onGoing?: () => void;
  onNextTime?: () => void;
};

export default function EventCard({ event, onPress, onGoing, onNextTime }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.94}
      onPress={onPress}
      testID={`event-card-${event.id}`}
      style={styles.cardShadow}
    >
      <View style={styles.card}>
        {/* Host header */}
        <View style={styles.hostRow}>
          <Image source={{ uri: event.host_avatar }} style={styles.hostAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.hostName}>{event.host_name}</Text>
            <Text style={styles.hostMeta}>
              {formatDate(event.date)}
            </Text>
          </View>
          {event.is_premium && (
            <View style={styles.premium}>
              <Sparkles size={11} color="#fff" strokeWidth={2.4} />
              <Text style={styles.premiumLabel}>Premium</Text>
            </View>
          )}
        </View>

        {/* Hero */}
        <ImageBackground source={{ uri: event.image }} style={styles.hero} imageStyle={styles.heroImage}>
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.0)", "rgba(0,0,0,0.45)"]}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>

        {/* Title + Location */}
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
          <View style={styles.locRow}>
            <MapPin size={13} color={COLORS.textSecondary} strokeWidth={2} />
            <Text style={styles.location} numberOfLines={1}>{event.location}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <View style={styles.attendees}>
            {event.attendees.slice(0, 3).map((a, i) => (
              <Image
                key={i}
                source={{ uri: a }}
                style={[styles.attAvatar, { marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }]}
              />
            ))}
            <Text style={styles.attCount}>+{Math.max(0, event.member_count - 3)} • {event.member_count} members</Text>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              testID={`event-next-${event.id}`}
              activeOpacity={0.85}
              onPress={onNextTime}
              style={styles.btnGhost}
            >
              <Text style={styles.btnGhostLabel}>Next time</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID={`event-going-${event.id}`}
              activeOpacity={0.85}
              onPress={onGoing}
              style={[styles.btnPrimary, event.going && styles.btnPrimaryActive]}
            >
              <Text style={styles.btnPrimaryLabel}>{event.going ? "Going ✓" : "Going"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    const day = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return `${day} · ${time}`;
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  cardShadow: {
    ...SHADOWS.md,
    borderRadius: RADII.xl,
    marginBottom: SPACING.lg,
    marginHorizontal: SPACING.lg,
    backgroundColor: "transparent",
  },
  card: {
    borderRadius: RADII.xl,
    backgroundColor: COLORS.glassStrong,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },
  hostAvatar: { width: 38, height: 38, borderRadius: 19, marginRight: 4 },
  hostName: { fontSize: 14, fontWeight: "600", color: COLORS.text, letterSpacing: -0.2 },
  hostMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  premium: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: COLORS.gold,
    borderRadius: RADII.pill,
  },
  premiumLabel: { fontSize: 11, fontWeight: "700", color: "#fff", letterSpacing: 0.2 },
  hero: { height: 220, width: "100%", marginHorizontal: 0 },
  heroImage: { borderRadius: 0 },
  body: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  title: { fontSize: 20, fontWeight: "700", color: COLORS.text, letterSpacing: -0.4 },
  locRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 5 },
  location: { fontSize: 13, color: COLORS.textSecondary },
  actions: { paddingHorizontal: 16, paddingBottom: 14, paddingTop: 10 },
  attendees: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  attAvatar: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: "#FFF" },
  attCount: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 8, fontWeight: "500" },
  btnRow: { flexDirection: "row", gap: 10 },
  btnGhost: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(20,40,80,0.08)",
    alignItems: "center",
  },
  btnGhostLabel: { fontSize: 14, fontWeight: "600", color: COLORS.text, letterSpacing: -0.2 },
  btnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnPrimaryActive: { backgroundColor: COLORS.success, shadowColor: COLORS.success },
  btnPrimaryLabel: { fontSize: 14, fontWeight: "700", color: "#fff", letterSpacing: -0.1 },
});
