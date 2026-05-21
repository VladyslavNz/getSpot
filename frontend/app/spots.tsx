// Top Spots screen
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { ChevronLeft, Search, MapPin, Star } from "lucide-react-native";
import { api, Spot } from "../src/api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../src/theme";
import PillChips from "../src/components/PillChips";

const CATS = [
  { key: "All", label: "All" },
  { key: "Restaurants", label: "Restaurants" },
  { key: "Bars", label: "Bars" },
  { key: "Parks", label: "Parks" },
  { key: "Cafe", label: "Cafe" },
  { key: "Rooftop", label: "Rooftop" },
];

export default function TopSpots() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");

  useEffect(() => {
    api.spots(cat === "All" ? undefined : cat).then(setSpots).catch(() => {});
  }, [cat]);

  const filtered = spots.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.address.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconShadow} testID="spots-back">
          <BlurView intensity={60} tint="light" style={styles.iconBtn}>
            <ChevronLeft size={20} color={COLORS.text} strokeWidth={2.4} />
          </BlurView>
        </TouchableOpacity>
        <Text style={styles.title}>Top Spots</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchShadow}>
        <BlurView intensity={60} tint="light" style={styles.search}>
          <Search size={16} color={COLORS.textSecondary} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Explore cafes, parks, rooftops..."
            placeholderTextColor={COLORS.textTertiary}
            value={query}
            onChangeText={setQuery}
            testID="spots-search"
          />
        </BlurView>
      </View>

      <View style={{ height: SPACING.lg }} />

      <PillChips options={CATS} value={cat} onChange={setCat} />

      <View style={{ height: SPACING.lg }} />

      {filtered.map((s) => (
        <TouchableOpacity
          key={s.id}
          activeOpacity={0.94}
          style={styles.spotShadow}
          testID={`spot-${s.id}`}
        >
          <BlurView intensity={50} tint="light" style={styles.spotCard}>
            <Image source={{ uri: s.image }} style={styles.spotImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.spotName}>{s.name}</Text>
              <View style={styles.spotMetaRow}>
                <MapPin size={11} color={COLORS.textSecondary} />
                <Text style={styles.spotAddr} numberOfLines={1}>{s.address}</Text>
              </View>
              <View style={styles.spotMetaRow}>
                <Text style={styles.rateLabel}>Rate</Text>
                <View style={styles.rateChip}>
                  <Star size={11} color={COLORS.gold} fill={COLORS.gold} />
                  <Text style={styles.rateValue}>{s.rating.toFixed(1)}/5</Text>
                </View>
                <Text style={styles.spotCat}> · {s.category}</Text>
              </View>
            </View>
          </BlurView>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  iconShadow: { ...SHADOWS.sm, borderRadius: 22 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1, borderColor: COLORS.glassBorder, overflow: "hidden",
  },
  title: { ...TYPE.h2, fontSize: 19 },
  searchShadow: { ...SHADOWS.sm, marginHorizontal: SPACING.lg, borderRadius: RADII.pill },
  search: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1, borderColor: COLORS.glassBorder, overflow: "hidden",
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text, paddingVertical: 0, outlineWidth: 0 } as any,
  spotShadow: { ...SHADOWS.sm, marginHorizontal: SPACING.lg, marginBottom: 12, borderRadius: RADII.lg },
  spotCard: {
    flexDirection: "row", alignItems: "center", padding: 12, gap: 12,
    borderRadius: RADII.lg,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1, borderColor: COLORS.glassBorder, overflow: "hidden",
  },
  spotImg: { width: 80, height: 80, borderRadius: RADII.md },
  spotName: { ...TYPE.h3, fontSize: 16 },
  spotMetaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  spotAddr: { ...TYPE.small, fontSize: 12, flex: 1 },
  rateLabel: { fontSize: 12, color: COLORS.textSecondary },
  rateChip: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "rgba(201,162,75,0.12)", borderRadius: 8 },
  rateValue: { fontSize: 12, color: COLORS.gold, fontWeight: "700" },
  spotCat: { fontSize: 12, color: COLORS.textSecondary },
});
