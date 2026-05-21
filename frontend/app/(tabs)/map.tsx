// Map tab — Apple-style with floating glass overlays
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronDown,
  Sliders,
  Crosshair,
  MapPin,
  Star,
  ArrowRight,
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

  useEffect(() => {
    (async () => {
      const [s, e] = await Promise.all([api.spots(), api.events()]);
      setSpots(s);
      setEvents(e);
      setSelected(e[0] || null);
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
        {/* Web preview marker overlays (since real map isn't available on web) */}
        {Platform.OS === "web" &&
          events.map((ev, i) => (
            <TouchableOpacity
              key={ev.id}
              activeOpacity={0.85}
              onPress={() => setSelected(ev)}
              style={[
                styles.webMarker,
                {
                  top: 200 + (i * 80) + (i % 2 === 0 ? 30 : 0),
                  left: 60 + (i * 50) + (i % 3 === 1 ? 80 : 0),
                },
              ]}
            >
              <View style={styles.markerGlow} />
              <View style={styles.marker}>
                <MapPin size={14} color="#FFF" strokeWidth={2.4} />
              </View>
            </TouchableOpacity>
          ))}

        {/* Current location pulse — web only decoration */}
        {Platform.OS === "web" && (
          <View style={styles.currentLocWrap} pointerEvents="none">
            <View style={styles.currentLocPulse} />
            <View style={styles.currentLocDot} />
          </View>
        )}
      </PlatformMap>

      {/* Top floating bar */}
      <View style={[styles.topBar, { top: insets.top + 10 }]} pointerEvents="box-none">
        <TouchableOpacity style={styles.cityShadow} activeOpacity={0.85}>
          <BlurView intensity={70} tint="light" style={styles.cityBtn}>
            <MapPin size={14} color={COLORS.blue} strokeWidth={2.4} />
            <Text style={styles.cityLabel}>San Francisco</Text>
            <ChevronDown size={14} color={COLORS.text} strokeWidth={2.2} />
          </BlurView>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity style={styles.roundShadow} activeOpacity={0.85}>
            <BlurView intensity={70} tint="light" style={styles.roundBtn}>
              <Crosshair size={18} color={COLORS.text} strokeWidth={2.2} />
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.roundShadow}
            activeOpacity={0.85}
            onPress={() => router.push("/spots" as any)}
            testID="open-top-spots"
          >
            <BlurView intensity={70} tint="light" style={styles.roundBtn}>
              <Sliders size={18} color={COLORS.text} strokeWidth={2.2} />
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>

      {/* Center selected event card */}
      {selected && (
        <View style={styles.centerCardWrap} pointerEvents="box-none">
          <View style={styles.centerCardShadow}>
            <BlurView intensity={75} tint="light" style={styles.centerCard}>
              <Image source={{ uri: selected.image }} style={styles.centerImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.centerTitle} numberOfLines={1}>{selected.title}</Text>
                <View style={styles.centerMetaRow}>
                  <MapPin size={11} color={COLORS.textSecondary} />
                  <Text style={styles.centerMeta} numberOfLines={1}>{selected.location}</Text>
                </View>
                <View style={styles.centerBtnRow}>
                  <TouchableOpacity style={styles.miniGhost} activeOpacity={0.8}>
                    <Text style={styles.miniGhostLabel}>Next time</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.miniPrimary}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/event/${selected.id}` as any)}
                  >
                    <Text style={styles.miniPrimaryLabel}>Going</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        </View>
      )}

      {/* Bottom spots carousel */}
      <View style={styles.bottomWrap} pointerEvents="box-none">
        <View style={styles.bottomHeader}>
          <Text style={styles.bottomTitle}>Nearby Spots</Text>
          <TouchableOpacity onPress={() => router.push("/spots" as any)} activeOpacity={0.8} style={styles.seeAllBtn}>
            <Text style={styles.seeAll}>Top Spots</Text>
            <ArrowRight size={14} color={COLORS.blue} strokeWidth={2.4} />
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
              <BlurView intensity={70} tint="light" style={styles.spotCard}>
                <Image source={{ uri: sp.image }} style={styles.spotImg} />
                <View style={styles.spotMeta}>
                  <Text style={styles.spotName} numberOfLines={1}>{sp.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <Star size={11} color={COLORS.gold} fill={COLORS.gold} />
                    <Text style={styles.spotRating}>{sp.rating.toFixed(1)}</Text>
                    <Text style={styles.spotAddr} numberOfLines={1}> · {sp.category}</Text>
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EFE9DC" },

  topBar: {
    position: "absolute",
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  cityShadow: { ...SHADOWS.md, borderRadius: RADII.pill },
  cityBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  cityLabel: { ...TYPE.bodyMed, marginHorizontal: 4, fontSize: 14 },
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
    top: "50%",
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
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
    gap: 10,
    alignItems: "center",
  },
  centerImg: { width: 80, height: 80, borderRadius: RADII.md },
  centerTitle: { ...TYPE.h3, fontSize: 16 },
  centerMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  centerMeta: { ...TYPE.small, fontSize: 12 },
  centerBtnRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  miniGhost: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(20,40,80,0.08)",
  },
  miniGhostLabel: { fontSize: 12, fontWeight: "600", color: COLORS.text },
  miniPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.blue,
  },
  miniPrimaryLabel: { fontSize: 12, fontWeight: "700", color: "#FFF" },

  bottomWrap: {
    position: "absolute",
    bottom: 110,
    left: 0,
    right: 0,
  },
  bottomHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    marginBottom: 10,
  },
  bottomTitle: { ...TYPE.h3, color: COLORS.text },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  seeAll: { ...TYPE.bodyMed, color: COLORS.blue, fontWeight: "600", fontSize: 13 },
  carousel: { paddingHorizontal: SPACING.lg, gap: 12 },
  spotShadow: { ...SHADOWS.md, borderRadius: RADII.lg, marginRight: 12 },
  spotCard: {
    width: 230,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: RADII.lg,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
    gap: 10,
  },
  spotImg: { width: 52, height: 52, borderRadius: 12 },
  spotMeta: { flex: 1 },
  spotName: { ...TYPE.bodyMed, fontSize: 14 },
  spotRating: { fontSize: 12, color: COLORS.text, fontWeight: "600" },
  spotAddr: { fontSize: 11, color: COLORS.textSecondary, flex: 1 },
});
