// Discover (events feed) — premium light glass aesthetic
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Search, Bell } from "lucide-react-native";
import { api, Event, Story, User } from "../../src/api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../src/theme";
import StoryRing from "../../src/components/StoryRing";
import PillChips from "../../src/components/PillChips";
import EventCard from "../../src/components/EventCard";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past events" },
  { key: "trending", label: "Trending" },
  { key: "Wellness", label: "Wellness" },
  { key: "Music", label: "Music" },
  { key: "Culture", label: "Culture" },
  { key: "Outdoors", label: "Outdoors" },
];

export default function Discover() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [me, setMe] = useState<User | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [u, s, e] = await Promise.all([api.me(), api.stories(), api.events(filter)]);
      setMe(u);
      setStories(s);
      setEvents(e);
    } catch (err) {
      console.log("Load error", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleGoing = async (ev: Event) => {
    try {
      const r = await api.toggleGoing(ev.id);
      setEvents((prev) =>
        prev.map((e) => (e.id === ev.id ? { ...e, going: r.going, member_count: r.member_count } : e))
      );
    } catch {}
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.blue} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello} testID="discover-greeting">
            Hi, {me?.name?.split(" ")[0] || "there"} <Text style={styles.wave}>👋</Text>
          </Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} testID="search-btn" activeOpacity={0.8}>
            <BlurView intensity={50} tint="light" style={styles.iconBlur}>
              <Search size={18} color={COLORS.text} strokeWidth={2} />
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
            <BlurView intensity={50} tint="light" style={styles.iconBlur}>
              <Bell size={18} color={COLORS.text} strokeWidth={2} />
              <View style={styles.notiDot} />
            </BlurView>
          </TouchableOpacity>
          {me && (
            <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} activeOpacity={0.85}>
              <Image source={{ uri: me.avatar }} style={styles.headerAvatar} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesRow}
      >
        <View style={styles.addStory}>
          <View style={styles.addStoryRing}>
            <View style={styles.addStoryInner}>
              <Text style={styles.addStoryPlus}>+</Text>
            </View>
          </View>
          <Text style={styles.storyName}>Your Story</Text>
        </View>
        {stories.map((s) => (
          <StoryRing
            key={s.id}
            avatar={s.avatar}
            name={s.user_name}
            viewed={s.viewed}
            testID={`story-${s.id}`}
          />
        ))}
      </ScrollView>

      {/* Filters */}
      <PillChips
        options={FILTERS.map((f) =>
          f.key === "all" ? { ...f, count: events.length } : f
        )}
        value={filter}
        onChange={setFilter}
        testID="event-filters"
      />

      <View style={{ height: SPACING.lg }} />

      {/* Events */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={COLORS.blue} />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No events found</Text>
          <Text style={styles.emptySub}>Try another filter or create your own.</Text>
        </View>
      ) : (
        events.map((e) => (
          <EventCard
            key={e.id}
            event={e}
            onPress={() => router.push(`/event/${e.id}` as any)}
            onGoing={() => handleGoing(e)}
            onNextTime={() => {}}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: 6,
  },
  hello: { ...TYPE.hero, fontSize: 30 },
  wave: { fontSize: 28 },
  date: { ...TYPE.small, marginTop: 4 },
  headerIcons: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: { ...SHADOWS.sm, borderRadius: RADII.pill },
  iconBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.glassLight,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  notiDot: {
    position: "absolute",
    top: 9,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginLeft: 4, borderWidth: 2, borderColor: COLORS.glassBorder },
  storiesRow: { paddingLeft: SPACING.lg, paddingRight: 8, paddingVertical: SPACING.md },
  addStory: { alignItems: "center", marginRight: SPACING.md, width: 72 },
  addStoryRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  addStoryInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.blueLight,
    alignItems: "center",
    justifyContent: "center",
  },
  addStoryPlus: { fontSize: 28, color: COLORS.blueDark, fontWeight: "300", marginTop: -2 },
  storyName: { marginTop: 6, fontSize: 11, color: COLORS.text, fontWeight: "500" },
  loadingWrap: { paddingTop: 40, alignItems: "center" },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { ...TYPE.h3, marginBottom: 6 },
  emptySub: { ...TYPE.small, textAlign: "center" },
});
