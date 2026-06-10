import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  Animated,
  Easing,
  Dimensions,
  PanResponder,
  ScrollView,
  Platform,
} from "react-native";
import {
  MapPin,
  Calendar,
  Check,
  ListFilter,
  Globe,
  Bike,
  Coffee,
  Briefcase,
  Palette,
  HeartPulse,
  SlidersHorizontal,
  Navigation,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../theme";

const { height: SCREEN_H } = Dimensions.get("window");
const DRAG_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.5;

type MapContentFilter = "all" | "events" | "places";

type Props = {
  visible: boolean;
  onClose: () => void;
  // Map Content Filter state
  mapContentFilter: MapContentFilter;
  onMapContentFilterChange: (val: MapContentFilter) => void;
  // Distance Filter state
  distance: string;
  onDistanceChange: (val: string) => void;
  // Category Filter state
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  // Places Filter state
  onlyHighlyRated: boolean;
  onOnlyHighlyRatedChange: (val: boolean) => void;
  // Events Filter state
  onlyJoinedEvents: boolean;
  onOnlyJoinedEventsChange: (val: boolean) => void;
};

const CATEGORIES = [
  { key: "all", label: "All Types", Icon: ListFilter },
  { key: "cultural", label: "Cultural", Icon: Globe },
  { key: "activity", label: "Activity", Icon: Bike },
  { key: "informal", label: "Informal", Icon: Coffee },
  { key: "professional", label: "Professional", Icon: Briefcase },
  { key: "creative", label: "Creative", Icon: Palette },
  { key: "health", label: "Health", Icon: HeartPulse },
];

const DISTANCES = [
  { value: "1", label: "1 km" },
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "25", label: "25 km" },
  { value: "50", label: "50 km" },
];

const CONTENT_MODES = [
  { key: "all", label: "All Content", Icon: SlidersHorizontal, color: "#4E493F" },
  { key: "events", label: "Events Only", Icon: Calendar, color: "#4E6C3B" },
  { key: "places", label: "Places Only", Icon: MapPin, color: "#E07A8B" },
] as const;

export default function MapFilterSheet({
  visible,
  onClose,
  mapContentFilter,
  onMapContentFilterChange,
  distance,
  onDistanceChange,
  selectedCategory,
  onCategoryChange,
  onlyHighlyRated,
  onOnlyHighlyRatedChange,
  onlyJoinedEvents,
  onOnlyJoinedEventsChange,
}: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;

  const openSheet = () => {
    translateY.setValue(SCREEN_H);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 24,
      stiffness: 260,
      mass: 0.9,
    }).start();
  };

  const closeSheet = (callback?: () => void) => {
    Animated.timing(translateY, {
      toValue: SCREEN_H,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      callback?.();
    });
  };

  useEffect(() => {
    if (visible) openSheet();
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4 && g.dy > 0,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DRAG_THRESHOLD || g.vy > VELOCITY_THRESHOLD) {
          closeSheet(onClose);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 24,
            stiffness: 260,
            mass: 0.9,
          }).start();
        }
      },
    })
  ).current;

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, SCREEN_H],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Custom premium toggle switch
  const renderSwitch = (active: boolean, onToggle: () => void) => {
    return (
      <Pressable onPress={onToggle} style={[styles.switchContainer, active && styles.switchActive]}>
        <View style={[styles.switchKnob, active && styles.switchKnobActive]} />
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => closeSheet(onClose)}
    >
      <View style={styles.root}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
          pointerEvents={visible ? "auto" : "none"}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={StyleSheet.absoluteFill}
            onPress={() => closeSheet(onClose)}
          >
            <View style={styles.dim} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {/* Header & Drag Indicator */}
          <View {...panResponder.panHandlers} style={styles.dragArea}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.sheetTitle}>Filters</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => closeSheet(onClose)}>
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* 1. SECTION: MAP CONTENT */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Map Content</Text>
              <View style={styles.modeContainer}>
                {CONTENT_MODES.map((mode) => {
                  const active = mapContentFilter === mode.key;
                  return (
                    <TouchableOpacity
                      key={mode.key}
                      style={[styles.modeButton, active && styles.modeButtonActive]}
                      onPress={() => onMapContentFilterChange(mode.key)}
                    >
                      <mode.Icon
                        size={15}
                        color={active ? "#FFFFFF" : "#8A8576"}
                        strokeWidth={2.4}
                      />
                      <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
                        {mode.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. SECTION: DISTANCE */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Distance Radius</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
                {DISTANCES.map((d) => {
                  const active = distance === d.value;
                  return (
                    <TouchableOpacity
                      key={d.value}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => onDistanceChange(d.value)}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 3. SECTION: CATEGORIES */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Categories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => onCategoryChange(cat.key)}
                    >
                      <cat.Icon
                        size={13}
                        color={active ? "#FFFFFF" : "#8A8576"}
                        strokeWidth={2}
                      />
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 4. SECTION: PLACES */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Places Filters</Text>
              <View style={styles.rowItem}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>Highly Rated Only</Text>
                  <Text style={styles.rowSub}>Show places with rating 4.5★ and above</Text>
                </View>
                {renderSwitch(onlyHighlyRated, () => onOnlyHighlyRatedChange(!onlyHighlyRated))}
              </View>
            </View>

            {/* 5. SECTION: EVENTS */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Events Filters</Text>
              <View style={styles.rowItem}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>Joined Events Only</Text>
                  <Text style={styles.rowSub}>Show events you are currently attending</Text>
                </View>
                {renderSwitch(onlyJoinedEvents, () => onOnlyJoinedEventsChange(!onlyJoinedEvents))}
              </View>
            </View>
          </ScrollView>
          <View style={[styles.footerSpacer, { height: 16 + insets.bottom }]} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(20,30,50,0.15)" },

  sheet: {
    backgroundColor: "#FDFDFD",
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  dragArea: {
    paddingTop: 12,
    paddingBottom: 4,
    alignItems: "center",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  sheetTitle: {
    ...TYPE.h3,
    fontSize: 17,
    fontWeight: "700",
    color: "#4E493F",
  },
  closeBtn: {
    position: "absolute",
    right: SPACING.lg,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4E6C3B", // Forest green theme accent
  },
  scrollBody: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.xl,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8A8576",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Map Content selector style
  modeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    borderRadius: RADII.md,
    backgroundColor: "#F5F4EE",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  modeButtonActive: {
    backgroundColor: "#4E6C3B", // Active forest green
    borderColor: "#4E6C3B",
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4E493F",
  },
  modeLabelActive: {
    color: "#FFFFFF",
  },

  // Pills horizontal row
  pillsRow: {
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: RADII.pill,
    backgroundColor: "#F5F4EE",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  pillActive: {
    backgroundColor: "#4E6C3B",
    borderColor: "#4E6C3B",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4E493F",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },

  // Switch Row Item style
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: RADII.md,
    backgroundColor: "#F5F4EE",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4E493F",
  },
  rowSub: {
    fontSize: 11,
    color: "#8A8576",
  },

  // Custom switch container & knob
  switchContainer: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#D1D1D6",
    padding: 2,
    justifyContent: "center",
  },
  switchActive: {
    backgroundColor: "#4E6C3B",
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    ...SHADOWS.sm,
  },
  switchKnobActive: {
    alignSelf: "flex-end",
  },

  footerSpacer: {
    backgroundColor: "#FDFDFD",
  },
});
