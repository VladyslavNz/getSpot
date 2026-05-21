// Event detail screen
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, Heart, Share2, MapPin, Calendar, Users, BadgeCheck, Sparkles } from "lucide-react-native";
import { api, Event } from "../../src/api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../src/theme";

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState<Event | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (id) api.event(id).then(setEvent).catch(() => {});
  }, [id]);

  if (!event) return <View style={{ flex: 1, backgroundColor: COLORS.bg }} />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: event.image }} style={styles.hero}>
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "transparent", "rgba(245,239,230,1)"]}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.topBar, { top: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconShadow}>
              <BlurView intensity={60} tint="light" style={styles.iconBtn}>
                <ChevronLeft size={20} color={COLORS.text} strokeWidth={2.4} />
              </BlurView>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.iconShadow} testID="event-like">
                <BlurView intensity={60} tint="light" style={styles.iconBtn}>
                  <Heart size={18} color={liked ? COLORS.danger : COLORS.text} fill={liked ? COLORS.danger : "transparent"} strokeWidth={2} />
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconShadow}>
                <BlurView intensity={60} tint="light" style={styles.iconBtn}>
                  <Share2 size={18} color={COLORS.text} strokeWidth={2} />
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>

          {event.is_premium && (
            <View style={[styles.premiumBadge, { top: insets.top + 70 }]}>
              <Sparkles size={11} color="#FFF" strokeWidth={2.4} />
              <Text style={styles.premiumLabel}>Premium event</Text>
            </View>
          )}
        </ImageBackground>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.title}>{event.title}</Text>

          {/* Host */}
          <View style={styles.hostRow}>
            <Image source={{ uri: event.host_avatar }} style={styles.hostAvatar} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={styles.hostName}>Hosted by {event.host_name}</Text>
                <BadgeCheck size={14} color={COLORS.blue} fill={COLORS.blue} />
              </View>
              <Text style={styles.hostMeta}>Verified host · {event.category}</Text>
            </View>
            <TouchableOpacity style={styles.followBtn} activeOpacity={0.85}>
              <Text style={styles.followLabel}>Follow</Text>
            </TouchableOpacity>
          </View>

          {/* Info pills */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Calendar size={16} color={COLORS.blue} strokeWidth={2.2} />
              <Text style={styles.infoTitle}>Date & Time</Text>
              <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
            </View>
            <View style={styles.infoCard}>
              <MapPin size={16} color={COLORS.blue} strokeWidth={2.2} />
              <Text style={styles.infoTitle}>Location</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
            </View>
          </View>

          <View style={styles.attendCard}>
            <Users size={16} color={COLORS.blue} strokeWidth={2.2} />
            <Text style={styles.attendText}>{event.member_count} going</Text>
            <View style={styles.attendAvatars}>
              {event.attendees.slice(0, 4).map((a, i) => (
                <Image key={i} source={{ uri: a }} style={[styles.attendAvatar, { marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }]} />
              ))}
            </View>
          </View>

          {/* About */}
          <Text style={styles.sectionTitle}>About this event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <BlurView intensity={70} tint="light" style={styles.bottomInner}>
          <View>
            <Text style={styles.priceLabel}>FREE</Text>
            <Text style={styles.priceSub}>RSVP to join</Text>
          </View>
          <TouchableOpacity
            style={styles.joinBtn}
            activeOpacity={0.88}
            testID="event-join"
            onPress={async () => {
              const r = await api.toggleGoing(event.id);
              setEvent({ ...event, going: r.going, member_count: r.member_count });
            }}
          >
            <Text style={styles.joinLabel}>{event.going ? "You're going ✓" : "I'm Going"}</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }) +
      " · " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  hero: { height: 380, width: "100%" },
  topBar: {
    position: "absolute",
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconShadow: { ...SHADOWS.md, borderRadius: 22 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 1, borderColor: COLORS.glassBorder, overflow: "hidden",
  },
  premiumBadge: {
    position: "absolute",
    right: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: COLORS.gold,
    borderRadius: RADII.pill,
    ...SHADOWS.md,
  },
  premiumLabel: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  body: { paddingHorizontal: SPACING.lg, marginTop: -12 },
  title: { ...TYPE.hero, fontSize: 28 },
  hostRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.lg, gap: 12 },
  hostAvatar: { width: 44, height: 44, borderRadius: 22 },
  hostName: { ...TYPE.bodyMed, fontSize: 14 },
  hostMeta: { ...TYPE.small, marginTop: 1 },
  followBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.text,
  },
  followLabel: { color: "#FFF", fontWeight: "700", fontSize: 12 },

  infoGrid: { flexDirection: "row", gap: 10, marginTop: SPACING.xl },
  infoCard: {
    flex: 1, padding: 14, borderRadius: RADII.lg,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1, borderColor: COLORS.glassBorder,
    ...SHADOWS.sm, gap: 6,
  },
  infoTitle: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
  infoValue: { ...TYPE.bodyMed, fontSize: 14 },

  attendCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginTop: 10, padding: 14, borderRadius: RADII.lg,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1, borderColor: COLORS.glassBorder,
    ...SHADOWS.sm,
  },
  attendText: { ...TYPE.bodyMed, fontSize: 14, flex: 1 },
  attendAvatars: { flexDirection: "row" },
  attendAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: "#FFF" },

  sectionTitle: { ...TYPE.h3, marginTop: SPACING.xl, marginBottom: 8 },
  description: { ...TYPE.body, lineHeight: 22, color: COLORS.textSecondary },

  bottomBar: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    ...SHADOWS.lg,
  },
  bottomInner: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: SPACING.lg, paddingTop: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderTopWidth: 1, borderTopColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  priceLabel: { fontWeight: "700", fontSize: 20, color: COLORS.text },
  priceSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  joinBtn: {
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: RADII.pill, backgroundColor: COLORS.blue,
    ...SHADOWS.glow,
  },
  joinLabel: { color: "#FFF", fontWeight: "700", fontSize: 14 },
});
