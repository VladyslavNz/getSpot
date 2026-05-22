// Filter sheet — instant dim, always-reliable slide-up, drag-to-close
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Dimensions,
  PanResponder,
} from "react-native";
import { BlurView } from "expo-blur";
import {
  Globe,
  Bike,
  Coffee,
  Briefcase,
  Palette,
  HeartPulse,
  Check,
  ListFilter,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../theme";

const TYPES = [
  { key: "all", label: "All types", Icon: ListFilter, tint: "#6B6B72" },
  { key: "cultural", label: "Cultural", Icon: Globe, tint: "#6D94C5" },
  { key: "activity", label: "Activity", Icon: Bike, tint: "#3FB58B" },
  { key: "informal", label: "Informal", Icon: Coffee, tint: "#C9A24B" },
  { key: "professional", label: "Professional", Icon: Briefcase, tint: "#1C1C1E" },
  { key: "creative", label: "Creative", Icon: Palette, tint: "#E07A8B" },
  { key: "health", label: "Health", Icon: HeartPulse, tint: "#E5604E" },
];

const { height: SCREEN_H } = Dimensions.get("window");
const DRAG_THRESHOLD = 120; // px to dismiss
const VELOCITY_THRESHOLD = 0.6;

type Props = {
  visible: boolean;
  value: string;
  onChange: (key: string) => void;
  onClose: () => void;
};

export default function TypeFilterSheet({ visible, value, onChange, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;

  const openSheet = () => {
    // ALWAYS reset position before opening so spring plays every time
    translateY.setValue(SCREEN_H);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 22,
      stiffness: 240,
      mass: 0.9,
    }).start();
  };

  const closeSheet = (callback?: () => void) => {
    Animated.timing(translateY, {
      toValue: SCREEN_H,
      duration: 240,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      callback?.();
    });
  };

  useEffect(() => {
    if (visible) openSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Drag-to-close gesture
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
            damping: 22,
            stiffness: 240,
            mass: 0.9,
          }).start();
        }
      },
    })
  ).current;

  // Dynamic backdrop opacity tied to drag
  const backdropOpacity = translateY.interpolate({
    inputRange: [0, SCREEN_H],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const handleApply = () => closeSheet(onClose);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => closeSheet(onClose)}
    >
      <View style={styles.root}>
        {/* Backdrop — instant fade controlled by sheet position */}
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
            <BlurView intensity={14} tint="dark" style={StyleSheet.absoluteFill} />
          </TouchableOpacity>
        </Animated.View>

        {/* Sheet panel */}
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
        >
          {/* Drag handle area — pan responder attached here for natural feel */}
          <View {...panResponder.panHandlers} style={styles.dragArea}>
            <View style={styles.handle} />
          </View>

          <View style={styles.body}>
            <Text style={styles.title}>Filter by type</Text>

            <View style={styles.list}>
              {TYPES.map((t) => {
                const active = value === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    testID={`type-${t.key}`}
                    activeOpacity={0.85}
                    onPress={() => onChange(t.key)}
                    style={[styles.row, active && styles.rowActive]}
                  >
                    <View style={[styles.iconBox, { backgroundColor: `${t.tint}14` }]}>
                      <t.Icon size={18} color={t.tint} strokeWidth={2.2} />
                    </View>
                    <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                      {t.label}
                    </Text>
                    {active && <Check size={18} color={COLORS.blue} strokeWidth={2.6} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              testID="filter-apply"
              activeOpacity={0.88}
              onPress={handleApply}
              style={styles.applyBtn}
            >
              <Text style={styles.applyLabel}>Show events</Text>
            </TouchableOpacity>
          </View>

          {/* Safe-area filler — same bg, no gap at the bottom */}
          <View style={[styles.safeFill, { height: insets.bottom }]} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(20,30,50,0.34)" },

  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: RADII.xxl,
    borderTopRightRadius: RADII.xxl,
    ...SHADOWS.lg,
  },
  dragArea: {
    paddingTop: 10,
    paddingBottom: 6,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(20,40,80,0.18)",
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 4,
    paddingBottom: SPACING.md,
  },
  safeFill: { backgroundColor: "#FFFFFF" },

  title: { ...TYPE.h2, fontSize: 20, marginBottom: SPACING.md },
  list: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: RADII.md,
    backgroundColor: "rgba(20,40,80,0.03)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  rowActive: {
    backgroundColor: "rgba(109,148,197,0.10)",
    borderColor: "rgba(109,148,197,0.35)",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { ...TYPE.bodyMed, fontSize: 15, flex: 1 },
  rowLabelActive: { color: COLORS.blue, fontWeight: "700" },
  applyBtn: {
    marginTop: SPACING.lg,
    paddingVertical: 16,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    ...SHADOWS.glow,
  },
  applyLabel: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
