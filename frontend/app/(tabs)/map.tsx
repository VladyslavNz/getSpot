// Map tab — clean initial state, search at top, city below, glass Nearby Spots
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import {
  ChevronDown,
  Sliders,
  Crosshair,
  MapPin,
  Star,
  ArrowRight,
  Search,
  Users,
  X,
} from "lucide-react-native";
import PlatformMap from "../../src/components/PlatformMap";
import { api, Spot, Event } from "../../src/api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../src/theme";

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selected, setSelected] = useState<Event | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const [s, e] = await Promise.all([api.spots(), api.events()]);
      setSpots(s);
      setEvents(e);
      // No automatic selection — clean initial state
    })();
  }, []);

  return (
    <View style={styles.root}>
      <PlatformMap
        initialLatitude={37.7749}
        initialLongitude={-122.4194}
        markers={events.map((ev) => ({
          id: ev.id,
          latitude: ev.latitude,
          longitude: ev.longitude,
          onPress: () => setSelected(ev),
        }))}
        renderCustomMarker={(m) => {
          const ev = events.find((e) => e.id === m.id);
          if (!ev) return null;
          return (
            <View style={styles.markerWrap}>
              <View style={styles.markerGlow} />
              <View style={styles.marker}>
                <MapPin size={14} color="#FFF" strokeWidth={2.4} />
              </View>
            </View>
          );
        }}
      >
        {/* Web preview marker overlays */}
        {Platform.OS === "web" &&
          events.map((ev, i) => (
            <TouchableOpacity
              key={ev.id}
              activeOpacity={0.85}
              onPress={() => setSelected(ev)}
              style={[
                styles.webMarker,
                {
                  top: 220 + i * 72 + (i % 2 === 0 ? 30 : 0),
                  left: 60 + i * 50 + (i % 3 === 1 ? 80 : 0),
                },
              ]}
            >
              <View style={styles.markerGlow} />
              <View style={styles.marker}>
                <MapPin size={14} color="#FFF" strokeWidth={2.4} />
              </View>
            </TouchableOpacity>
          ))}

        {Platform.OS === "web" && (
          <View style={styles.currentLocWrap} pointerEvents="none">
            <View style={styles.currentLocPulse} />
            <View style={styles.currentLocDot} />
          </View>
        )}
      </PlatformMap>

      {/* TOP CONTROLS — Row 1: Search + Location + Filter */}
      <View style={[styles.topZone, { top: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.controlsRow}>
          <View style={styles.searchShadow}>
            <BlurView intensity={70} tint="light" style={styles.searchBar}>
              <Search size={16} color={COLORS.textSecondary} strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Places, events, people..."
                placeholderTextColor={COLORS.textTertiary}
                value={query}
                onChangeText={setQuery}
                testID="map-search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
                  <X size={14} color={COLORS.textSecondary} strokeWidth={2.4} />
                </TouchableOpacity>
              )}
            </BlurView>
          </View>

          <TouchableOpacity style={styles.roundShadow} activeOpacity={0.85} testID="locate-me">
            <BlurView intensity={70} tint="light" style={styles.roundBtn}>
              <Crosshair size={18} color={COLORS.text} strokeWidth={2.2} />
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.roundShadow}
            activeOpacity={0.85}
            onPress={() => router.push("/spots" as any)}
            testID="map-filter"
          >
            <BlurView intensity={70} tint="light" style={styles.roundBtn}>
              <Sliders size={18} color={COLORS.text} strokeWidth={2.2} />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Row 2: My City pill */}
        <View style={styles.cityRow}>
          <TouchableOpacity style={styles.cityShadow} activeOpacity={0.85} testID="my-city">
            <BlurView intensity={70} tint="light" style={styles.cityBtn}>
              <MapPin size={13} color={COLORS.blue} strokeWidth={2.4} />
              <Text style={styles.cityLabel}>San Francisco</Text>
              <ChevronDown size={13} color={COLORS.text} strokeWidth={2.2} />
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected event card — only when a marker is tapped */}
      {selected && (
        <View style={styles.centerCardWrap} pointerEvents="box-none">
          <View style={styles.centerCardShadow}>
            <BlurView intensity={75} tint="light" style={styles.centerCard}>
              <Image source={{ uri: selected.image }} style={styles.centerImg} />
              <View style={{ flex: 1 }}>
                <View style={styles.centerTitleRow}>
                  <Text style={styles.centerTitle} numberOfLines={1}>{selected.title}</Text>
                  <TouchableOpacity onPress={() => setSelected(null)} hitSlop={10} testID="close-event-card">
                    <X size={16} color={COLORS.textSecondary} strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>
                <View style={styles.centerMetaRow}>
                  <MapPin size={11} color={COLORS.textSecondary} />
                  <Text style={styles.centerMeta} numberOfLines={1}>{selected.location}</Text>
                </View>
                <View style={styles.centerSocial}>
                  <Users size={11} color={COLORS.blue} strokeWidth={2.2} />
                  <Text style={styles.centerSocialText}>{selected.member_count} going</Text>
                </View>
                <TouchableOpacity
                  style={styles.centerCTA}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/event/${selected.id}` as any)}
                  testID="open-event"
                >
                  <Text style={styles.centerCTALabel}>View event</Text>
                  <ArrowRight size={13} color="#FFF" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </View>
      )}

      {/* Bottom Nearby Spots — wrapped in glass panel for readability */}
      <View style={[styles.bottomWrap, { bottom: 130 }]} pointerEvents="box-none">
        <View style={styles.bottomPanelShadow}>
          <BlurView intensity={60} tint="light" style={styles.bottomPanel}>
            <View style={styles.bottomHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bottomTitle}>Nearby Spots</Text>
                <Text style={styles.bottomSub}>Curated places near you</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/spots" as any)}
                activeOpacity={0.85}
                style={styles.seeAllBtn}
                testID="open-top-spots"
              >
                <Text style={styles.seeAll}>Top Spots</Text>
                <ArrowRight size={13} color={COLORS.blue} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {spots.map((sp) => (
                <TouchableOpacity
                  key={sp.id}
                  testID={`map-spot-${sp.id}`}
                  activeOpacity={0.92}
                  style={styles.spotShadow}
                >
                  <View style={styles.spotCard}>
                    <Image source={{ uri: sp.image }} style={styles.spotImg} />
                    <View style={styles.spotMeta}>
                      <Text style={styles.spotName} numberOfLines={1}>{sp.name}</Text>
                      <View style={styles.spotRow}>
                        <Star size={11} color={COLORS.gold} fill={COLORS.gold} />
                        <Text style={styles.spotRating}>{sp.rating.toFixed(1)}</Text>
                        <Text style={styles.spotDot}> · </Text>
                        <Text style={styles.spotCat} numberOfLines={1}>{sp.category}</Text>
                      </View>
                      <View style={styles.spotSocial}>
                        <Users size={10} color={COLORS.blue} strokeWidth={2.2} />
                        <Text style={styles.spotSocialText}>{20 + (sp.id.charCodeAt(2) % 18)} here now</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </BlurView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EFE9DC" },

  topZone: {
    position: "absolute",
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 10,
  },
  controlsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  searchShadow: { flex: 1, ...SHADOWS.md, borderRadius: RADII.pill },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    paddingVertical: 0,
    outlineWidth: 0,
  } as any,
  roundShadow: { ...SHADOWS.md, borderRadius: 22 },
  roundBtn: {
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

  cityRow: { marginTop: 10, flexDirection: "row" },
  cityShadow: { ...SHADOWS.sm, borderRadius: RADII.pill },
  cityBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  cityLabel: { ...TYPE.bodyMed, fontSize: 13, marginHorizontal: 2 },

  markerWrap: { alignItems: "center", justifyContent: "center" },
  markerGlow: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.blue,
    opacity: 0.18,
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    ...SHADOWS.md,
  },
  webMarker: { position: "absolute", zIndex: 5 },

  currentLocWrap: {
    position: "absolute",
    top: "48%",
    left: "50%",
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocPulse: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.blue,
    opacity: 0.18,
  },
  currentLocDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.blue,
    borderWidth: 3,
    borderColor: "#FFF",
    ...SHADOWS.md,
  },

  centerCardWrap: {
    position: "absolute",
    top: "32%",
    left: SPACING.lg,
    right: SPACING.lg,
    alignItems: "center",
  },
  centerCardShadow: { ...SHADOWS.lg, borderRadius: RADII.xl, width: "100%" },
  centerCard: {
    flexDirection: "row",
    padding: 10,
    borderRadius: RADII.xl,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
    gap: 12,
    alignItems: "center",
  },
  centerImg: { width: 84, height: 96, borderRadius: RADII.md },
  centerTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  centerTitle: { ...TYPE.h3, fontSize: 16, flex: 1 },
  centerMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  centerMeta: { ...TYPE.small, fontSize: 12 },
  centerSocial: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  centerSocialText: { fontSize: 11, color: COLORS.blue, fontWeight: "700" },
  centerCTA: {
    marginTop: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.blue,
  },
  centerCTALabel: { color: "#FFF", fontWeight: "700", fontSize: 12 },

  // Bottom panel
  bottomWrap: {
    position: "absolute",
    left: SPACING.lg,
    right: SPACING.lg,
  },
  bottomPanelShadow: { ...SHADOWS.lg, borderRadius: RADII.xl },
  bottomPanel: {
    borderRadius: RADII.xl,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: 12,
    overflow: "hidden",
  },
  bottomHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  bottomTitle: { ...TYPE.h3, fontSize: 16 },
  bottomSub: { ...TYPE.small, fontSize: 11, marginTop: 1 },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  seeAll: { color: COLORS.blue, fontWeight: "700", fontSize: 12 },
  carousel: { paddingHorizontal: 12, gap: 10 },
  spotShadow: { ...SHADOWS.sm, borderRadius: RADII.lg, marginRight: 10 },
  spotCard: {
    width: 248,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: RADII.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: 12,
  },
  spotImg: { width: 64, height: 64, borderRadius: 12 },
  spotMeta: { flex: 1 },
  spotName: { ...TYPE.bodyMed, fontSize: 14 },
  spotRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  spotRating: { fontSize: 12, color: COLORS.text, fontWeight: "700" },
  spotDot: { fontSize: 12, color: COLORS.textTertiary },
  spotCat: { fontSize: 11, color: COLORS.textSecondary, flex: 1 },
  spotSocial: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  spotSocialText: { fontSize: 11, color: COLORS.blue, fontWeight: "700" },
});
