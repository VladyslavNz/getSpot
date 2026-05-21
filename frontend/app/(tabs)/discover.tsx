// Discover (Events) — clean light list with 4 tabs (Overview / Joined / Past / My)
// + search bar + type filter bottom sheet, matching the user-supplied reference.
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, SlidersHorizontal } from "lucide-react-native";
import { api, Event } from "../../src/api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../src/theme";
import EventListCard, { TYPE_META } from "../../src/components/EventListCard";
import TypeFilterSheet from "../../src/components/TypeFilterSheet";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "joined", label: "Joined" },
  { key: "past", label: "Past" },
  { key: "mine", label: "My events" },
];

export default function Discover() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [tab, setTab] = useState("overview");
  const [typeFilter, setTypeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.events({ tab, event_type: typeFilter });
      setEvents(data);
    } catch (err) {
      console.log("Load error", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const filtered = query
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          e.city.toLowerCase().includes(query.toLowerCase()) ||
          e.location.toLowerCase().includes(query.toLowerCase())
      )
    : events;

  const typeChipLabel =
    typeFilter === "all" ? null : TYPE_META[typeFilter]?.label || typeFilter;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.blue} />
        }
      >
        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.title} testID="discover-title">Events</Text>
        </View>

        {/* Search */}
        <View style={styles.searchShadow}>
          <View style={styles.search}>
            <Search size={16} color={COLORS.textSecondary} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by event or city..."
              placeholderTextColor={COLORS.textTertiary}
              value={query}
              onChangeText={setQuery}
              testID="event-search"
            />
          </View>
        </View>

        {/* Tabs row + filter button */}
        <View style={styles.tabsRow}>
          <View style={styles.tabsGroup}>
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <TouchableOpacity
                  key={t.key}
                  testID={`tab-${t.key}`}
                  activeOpacity={0.85}
                  onPress={() => setTab(t.key)}
                  style={styles.tabBtn}
                >
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>
                    {t.label}
                  </Text>
                  {active && <View style={styles.tabUnderline} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            testID="open-type-filter"
            activeOpacity={0.85}
            onPress={() => setFilterOpen(true)}
            style={styles.filterBtnShadow}
          >
            <View style={styles.filterBtn}>
              <SlidersHorizontal size={16} color={COLORS.text} strokeWidth={2.2} />
              {typeFilter !== "all" && <View style={styles.filterDot} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Active type filter pill (if applied) */}
        {typeChipLabel && (
          <View style={styles.activeTypeWrap}>
            <View style={styles.activeTypeChip}>
              <Text style={styles.activeTypeLabel}>Type: {typeChipLabel}</Text>
              <TouchableOpacity
                testID="clear-type-filter"
                onPress={() => setTypeFilter("all")}
                style={styles.clearBtn}
              >
                <Text style={styles.clearLabel}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Section header */}
        <Text style={styles.sectionLabel}>
          {filtered.length} {filtered.length === 1 ? "event" : "events"}
        </Text>

        {/* List */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={COLORS.blue} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No events here yet</Text>
            <Text style={styles.emptySub}>
              {tab === "mine"
                ? "Create your first event with the + button."
                : tab === "joined"
                ? "Events you join will appear here."
                : "Try a different filter or check back soon."}
            </Text>
          </View>
        ) : (
          filtered.map((e) => (
            <EventListCard
              key={e.id}
              event={e}
              onPress={() => router.push(`/event/${e.id}` as any)}
            />
          ))
        )}
      </ScrollView>

      <TypeFilterSheet
        visible={filterOpen}
        value={typeFilter}
        onChange={setTypeFilter}
        onClose={() => setFilterOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  titleRow: {
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingTop: 4,
  },
  title: { ...TYPE.h1, fontSize: 26 },
  searchShadow: { ...SHADOWS.sm, marginHorizontal: SPACING.lg, borderRadius: RADII.pill, marginBottom: SPACING.md },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADII.pill,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(20,40,80,0.08)",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 0,
    outlineWidth: 0,
  } as any,

  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginTop: 4,
  },
  tabsGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  tabBtn: {
    flexShrink: 1,
    paddingHorizontal: 4,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 12,
  },
  tabLabel: { fontSize: 13, fontWeight: "500", color: COLORS.textSecondary, letterSpacing: -0.2 },
  tabLabelActive: { color: COLORS.text, fontWeight: "700" },
  tabUnderline: {
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.text,
    marginTop: 6,
  },
  filterBtnShadow: { ...SHADOWS.sm, borderRadius: 20, marginLeft: 12 },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(20,40,80,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  filterDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.blue,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },

  activeTypeWrap: { paddingHorizontal: SPACING.lg, marginTop: 10 },
  activeTypeChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(109,148,197,0.12)",
    borderWidth: 1,
    borderColor: "rgba(109,148,197,0.30)",
  },
  activeTypeLabel: { fontSize: 12, fontWeight: "600", color: COLORS.blue },
  clearBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  clearLabel: { color: "#FFF", fontSize: 14, fontWeight: "700", lineHeight: 16 },

  sectionLabel: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.6,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  loadingWrap: { paddingTop: 40, alignItems: "center" },
  empty: { alignItems: "center", paddingTop: 48, paddingHorizontal: SPACING.xl },
  emptyTitle: { ...TYPE.h3, marginBottom: 8 },
  emptySub: { ...TYPE.small, textAlign: "center", lineHeight: 19 },
});
