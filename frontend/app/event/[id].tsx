// Event detail — overlapping glass content card, stacked info rows, premium join CTA
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
import {
  ChevronLeft,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Users,
  BadgeCheck,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Plus,
} from "lucide-react-native";
import { api, Event } from "../../src/api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../src/theme";
import { TYPE_META } from "../../src/components/EventListCard";

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

  const typeMeta = TYPE_META[event.event_type] || TYPE_META.informal;
  const TypeIcon = typeMeta.Icon;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <ImageBackground source={{ uri: event.image }} style={styles.hero} resizeMode="cover">
          <LinearGradient
            colors={["rgba(0,0,0,0.35)", "transparent", "rgba(245,239,230,1)"]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.topBar, { top: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconShadow} testID="event-back">
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
              <TouchableOpacity style={styles.iconShadow} testID="event-share">
                <BlurView intensity={60} tint="light" style={styles.iconBtn}>
                  <Share2 size={18} color={COLORS.text} strokeWidth={2} />
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>

          {event.is_premium && (
            <View style={[styles.premiumBadge, { top: insets.top + 72 }]}>
              <Sparkles size={11} color="#FFF" strokeWidth={2.4} />
              <Text style={styles.premiumLabel}>Premium event</Text>
            </View>
          )}
        </ImageBackground>

        {/* OVERLAPPING CONTENT */}
        <View style={styles.contentWrap}>
          <View style={styles.contentCardShadow}>
            <BlurView intensity={50} tint="light" style={styles.contentCard}>
              {/* Type eyebrow */}
              <View style={styles.eyebrowRow}>
                <View style={[styles.eyebrowIcon, { backgroundColor: `${typeMeta.tint}18` }]}>
                  <TypeIcon size={12} color={typeMeta.tint} strokeWidth={2.4} />
                </View>
                <Text style={[styles.eyebrowText, { color: typeMeta.tint }]}>
                  {typeMeta.label.toUpperCase()}
                </Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>{event.title}</Text>

              {/* Attendees inline */}
              <View style={styles.attRow}>
                <View style={styles.attStack}>
                  {event.attendees.slice(0, 3).map((a, i) => (
                    <Image
                      key={i}
                      source={{ uri: a }}
                      style={[styles.attAvatar, { marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }]}
                    />
                  ))}
                </View>
                <Users size={13} color={COLORS.textSecondary} strokeWidth={2} />
                <Text style={styles.attText}>
                  {event.capacity === 0
                    ? `${event.member_count} going · open`
                    : `${event.member_count}/${event.capacity} going`}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Stacked info rows */}
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Calendar size={16} color={COLORS.text} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoPrimary}>{formatDate(event.date)}</Text>
                  <Text style={styles.infoSecondary}>{formatTimeRange(event.date)}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MapPin size={16} color={COLORS.text} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoPrimary}>{event.location.split(",")[0]}</Text>
                  <Text style={styles.infoSecondary}>{event.city}</Text>
                </View>
                <ChevronRight size={16} color={COLORS.textTertiary} />
              </View>

              {/* Discussion row */}
              <TouchableOpacity activeOpacity={0.85} style={styles.discussionRow}>
                <View style={styles.discussionIcon}>
                  <MessageSquare size={16} color={COLORS.text} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoPrimary}>Discussion</Text>
                  <Text style={styles.infoSecondary} numberOfLines={1}>
                    Got a question? Join to ask...
                  </Text>
                </View>
                <ChevronRight size={16} color={COLORS.textTertiary} />
              </TouchableOpacity>
            </BlurView>
          </View>

          {/* About */}
          <Text style={styles.sectionTitle}>About this event</Text>
          <Text style={styles.description}>{event.description}</Text>

          {/* Host */}
          <Text style={styles.sectionTitle}>Organizer</Text>
          <TouchableOpacity activeOpacity={0.92} style={styles.hostShadow}>
            <View style={styles.hostCard}>
              <Image source={{ uri: event.host_avatar }} style={styles.hostAvatar} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Text style={styles.hostName}>{event.host_name}</Text>
                  <BadgeCheck size={14} color={COLORS.blue} fill={COLORS.blue} />
                </View>
                <Text style={styles.hostMeta}>Verified host</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textTertiary} />
            </View>
          </TouchableOpacity>

          {/* Going (people) */}
          {event.attendees.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Who's going ({event.member_count})</Text>
              <View style={styles.peopleList}>
                {event.attendees.slice(0, 4).map((a, i) => (
                  <View key={i} style={styles.personRow}>
                    <Image source={{ uri: a }} style={styles.personAvatar} />
                    <Text style={styles.personName}>Attendee {i + 1}</Text>
                    <ChevronRight size={15} color={COLORS.textTertiary} />
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 14 }]} pointerEvents="box-none">
        <BlurView intensity={70} tint="light" style={styles.bottomInner}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backCircle}
            testID="event-bottom-back"
            activeOpacity={0.85}
          >
            <ChevronLeft size={18} color={COLORS.text} strokeWidth={2.4} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.joinBtn}
            activeOpacity={0.88}
            testID="event-join"
            onPress={async () => {
              const r = await api.toggleGoing(event.id);
              setEvent({ ...event, going: r.going, member_count: r.member_count });
            }}
          >
            <LinearGradient
              colors={event.going ? ["#3FB58B", "#2E8F6E"] : ["#6CC6C2", "#3DA4A8", "#2C7E91"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.joinGradient}
            >
              <View style={styles.joinPlusWrap}>
                <Plus size={16} color="#fff" strokeWidth={2.8} />
              </View>
              <Text style={styles.joinLabel}>
                {event.going ? "You're going" : "Join"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Image source={{ uri: event.host_avatar }} style={styles.bottomAvatar} />
        </BlurView>
      </View>
    </View>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
  } catch {
    return iso;
  }
}

function formatTimeRange(iso: string) {
  try {
    const d = new Date(iso);
    const end = new Date(d.getTime() + 3 * 3600 * 1000);
    const fmt = (x: Date) =>
      x.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${fmt(d)} — ${fmt(end)}`;
  } catch {
    return "";
  }
}

const styles = StyleSheet.create({
  hero: { height: 340, width: "100%" },
  topBar: {
    position: "absolute",
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconShadow: { ...SHADOWS.md, borderRadius: 22 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
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

  // Overlap: pull content card up over hero
  contentWrap: {
    marginTop: -60,
    paddingHorizontal: SPACING.lg,
  },
  contentCardShadow: { ...SHADOWS.lg, borderRadius: RADII.xxl },
  contentCard: {
    padding: SPACING.lg,
    borderRadius: RADII.xxl,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },

  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  eyebrowIcon: {
    width: 22,
    height: 22,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrowText: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2 },

  title: { ...TYPE.hero, fontSize: 28, letterSpacing: -0.6 },

  attRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  attStack: { flexDirection: "row", marginRight: 4 },
  attAvatar: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: "#FFF" },
  attText: { ...TYPE.small, fontSize: 13, fontWeight: "500", color: COLORS.textSecondary },

  divider: { height: 1, backgroundColor: "rgba(20,40,80,0.06)", marginVertical: 14 },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(20,40,80,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoPrimary: { ...TYPE.bodyMed, fontSize: 15 },
  infoSecondary: { ...TYPE.small, fontSize: 13, marginTop: 1 },

  discussionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    marginTop: 10,
    borderRadius: RADII.lg,
    backgroundColor: "rgba(109,148,197,0.08)",
    borderWidth: 1,
    borderColor: "rgba(109,148,197,0.18)",
  },
  discussionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.6,
    marginTop: SPACING.xl,
    marginBottom: 10,
  },
  description: { ...TYPE.body, lineHeight: 23, color: COLORS.text, fontSize: 15 },

  hostShadow: { ...SHADOWS.sm, borderRadius: RADII.lg },
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: RADII.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  hostAvatar: { width: 44, height: 44, borderRadius: 22 },
  hostName: { ...TYPE.bodyMed, fontSize: 15 },
  hostMeta: { ...TYPE.small, marginTop: 2 },

  peopleList: { gap: 8 },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  personAvatar: { width: 36, height: 36, borderRadius: 18 },
  personName: { ...TYPE.bodyMed, fontSize: 14, flex: 1 },

  // Bottom action bar
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    gap: 10,
    ...SHADOWS.lg,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(20,40,80,0.08)",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  joinBtn: {
    flex: 1,
    borderRadius: RADII.pill,
    shadowColor: "#3DA4A8",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  joinGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: RADII.pill,
  },
  joinPlusWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  joinLabel: { color: "#FFF", fontWeight: "700", fontSize: 16, letterSpacing: -0.2 },
  bottomAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FFF",
    ...SHADOWS.sm,
  },
});
