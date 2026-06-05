// Event detail — sticky Back/Share, organizer under description,
// Who's going CTA → attendees route, glass bottom bar (Free | Join)
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
  Crown,
} from "lucide-react-native";
import { api, Event } from "../../../src/api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../../src/theme";
import { TYPE_META } from "../../../src/components/EventListCard";

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
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <ImageBackground source={{ uri: event.image }} style={styles.hero} resizeMode="cover">
          <LinearGradient
            colors={["rgba(0,0,0,0.35)", "transparent", "rgba(245,239,230,1)"]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
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
              <View style={styles.eyebrowRow}>
                <View style={[styles.eyebrowIcon, { backgroundColor: `${typeMeta.tint}18` }]}>
                  <TypeIcon size={12} color={typeMeta.tint} strokeWidth={2.4} />
                </View>
                <Text style={[styles.eyebrowText, { color: typeMeta.tint }]}>
                  {typeMeta.label.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.title}>{event.title}</Text>

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

              <TouchableOpacity activeOpacity={0.85} style={styles.infoRow}>
                <View style={styles.infoIcon}>
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

          {/* Organizer (kept under description for quick contact) */}
          <Text style={styles.sectionTitle}>Organizer</Text>
          <TouchableOpacity activeOpacity={0.92} style={styles.hostShadow} testID="event-organizer">
            <View style={styles.hostCard}>
              <View style={styles.hostAvatarWrap}>
                <Image source={{ uri: event.host_avatar }} style={styles.hostAvatar} />
                <View style={styles.crownBadge}>
                  <Crown size={9} color="#FFF" fill="#FFF" strokeWidth={2} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Text style={styles.hostName}>{event.host_name}</Text>
                  <BadgeCheck size={14} color={COLORS.blue} fill={COLORS.blue} />
                </View>
                <Text style={styles.hostMeta}>Host · Verified</Text>
              </View>
              <TouchableOpacity activeOpacity={0.85} style={styles.contactBtn} testID="contact-organizer">
                <Text style={styles.contactLabel}>Contact</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Who's going CTA → opens full attendees screen */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/event/${event.id}/attendees` as any)}
            style={styles.goingCardShadow}
            testID="see-attendees"
          >
            <View style={styles.goingCard}>
              <View style={styles.goingLeft}>
                <Text style={styles.goingLabel}>{"Who's going"}</Text>
                <Text style={styles.goingCount}>
                  {event.member_count} {event.member_count === 1 ? "person" : "people"}
                </Text>
              </View>
              <View style={styles.goingAvatars}>
                {event.attendees.slice(0, 4).map((a, i) => (
                  <Image
                    key={i}
                    source={{ uri: a }}
                    style={[styles.goingAvatar, { marginLeft: i === 0 ? 0 : -12, zIndex: 10 - i }]}
                  />
                ))}
                {event.member_count > 4 && (
                  <View style={[styles.goingMore, { marginLeft: -12 }]}>
                    <Text style={styles.goingMoreText}>+{event.member_count - 4}</Text>
                  </View>
                )}
              </View>
              <ChevronRight size={20} color={COLORS.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky floating Back & Share (over scroll content) */}
      <View pointerEvents="box-none" style={[styles.floatBar, { top: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.floatBtnShadow}
          testID="event-back"
          activeOpacity={0.85}
        >
          <BlurView intensity={70} tint="light" style={styles.floatBtn}>
            <ChevronLeft size={20} color={COLORS.text} strokeWidth={2.4} />
          </BlurView>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => setLiked(!liked)}
            style={styles.floatBtnShadow}
            testID="event-like"
            activeOpacity={0.85}
          >
            <BlurView intensity={70} tint="light" style={styles.floatBtn}>
              <Heart
                size={18}
                color={liked ? COLORS.danger : COLORS.text}
                fill={liked ? COLORS.danger : "transparent"}
                strokeWidth={2}
              />
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatBtnShadow} testID="event-share" activeOpacity={0.85}>
            <BlurView intensity={70} tint="light" style={styles.floatBtn}>
              <Share2 size={18} color={COLORS.text} strokeWidth={2} />
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>

      {/* GLASS BOTTOM BAR — Free | Join */}
      <View style={[styles.bottomWrap, { paddingBottom: insets.bottom + 12 }]} pointerEvents="box-none">
        <View style={styles.bottomShadow}>
          <BlurView intensity={80} tint="light" style={styles.bottomBar}>
            <LinearGradient
              colors={["rgba(255,255,255,0.85)", "rgba(245,239,230,0.78)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.bottomLeft}>
              <Text style={styles.freeLabel}>Free</Text>
            </View>

            <TouchableOpacity
              onPress={async () => {
                const r = await api.toggleGoing(event.id);
                setEvent({ ...event, going: r.going, member_count: r.member_count });
              }}
              testID="event-join"
              activeOpacity={0.9}
              style={styles.joinBtnShadow}
            >
              <View style={[styles.joinBtn, event.going && styles.joinBtnActive]}>
                <Text style={styles.joinLabel}>{event.going ? "Going ✓" : "Join"}</Text>
              </View>
            </TouchableOpacity>
          </BlurView>
        </View>
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

  // Sticky float bar (Back + Like + Share)
  floatBar: {
    position: "absolute",
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 20,
  },
  floatBtnShadow: { ...SHADOWS.md, borderRadius: 22 },
  floatBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },

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

  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
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
  hostAvatarWrap: { position: "relative" },
  hostAvatar: { width: 46, height: 46, borderRadius: 23 },
  crownBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  hostName: { ...TYPE.bodyMed, fontSize: 15 },
  hostMeta: { ...TYPE.small, marginTop: 2 },
  contactBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.text,
  },
  contactLabel: { color: "#FFF", fontWeight: "700", fontSize: 12 },

  // Who's going CTA card
  goingCardShadow: { ...SHADOWS.sm, marginTop: SPACING.xl, borderRadius: RADII.lg },
  goingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: RADII.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  goingLeft: { flex: 1 },
  goingLabel: { ...TYPE.bodyMed, fontSize: 15 },
  goingCount: { ...TYPE.small, fontSize: 13, marginTop: 2 },
  goingAvatars: { flexDirection: "row", alignItems: "center" },
  goingAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: "#FFF" },
  goingMore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#FFF",
    backgroundColor: COLORS.blueLight,
    alignItems: "center",
    justifyContent: "center",
  },
  goingMoreText: { fontSize: 10, fontWeight: "700", color: COLORS.blueDark },

  // Bottom bar (Free | Join)
  bottomWrap: {
    position: "absolute",
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: 0,
  },
  bottomShadow: { ...SHADOWS.lg, borderRadius: RADII.xxl },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: SPACING.lg,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: RADII.xxl,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  bottomLeft: { flex: 1, paddingLeft: 4, justifyContent: "center" },
  freeLabel: { fontSize: 20, fontWeight: "800", color: COLORS.text, letterSpacing: -0.5 },
  joinBtnShadow: {
    shadowColor: "#1A3252",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    borderRadius: RADII.xl,
  },
  joinBtn: {
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: RADII.xl,
    backgroundColor: COLORS.text,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  joinBtnActive: { backgroundColor: COLORS.success },
  joinLabel: { color: "#FFF", fontWeight: "700", fontSize: 16, letterSpacing: -0.2 },
});
