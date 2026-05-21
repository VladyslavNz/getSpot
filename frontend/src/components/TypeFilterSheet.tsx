// Bottom sheet — Event Type filter with instant dim + spring-slide panel
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  Easing,
  Dimensions,
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

type Props = {
  visible: boolean;
  value: string;
  onChange: (key: string) => void;
  onClose: () => void;
};

export default function TypeFilterSheet({ visible, value, onChange, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    if (visible) {
      // Backdrop is instant (Modal opens immediately).
      // Spring the panel up from below.
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 240,
        mass: 0.9,
      }).start();
    } else {
      // Slide down fast & smooth before unmount
      Animated.timing(translateY, {
        toValue: SCREEN_H,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Instant backdrop (no animation) */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>

      {/* Spring-sliding panel */}
      <Animated.View
        style={[
          styles.sheetWrap,
          { paddingBottom: insets.bottom + 16, transform: [{ translateY }] },
        ]}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
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
            onPress={onClose}
            style={styles.applyBtn}
          >
            <Text style={styles.applyLabel}>Show events</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20,30,50,0.32)",
  },
  sheetWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: RADII.xxl,
    borderTopRightRadius: RADII.xxl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(20,40,80,0.18)",
    alignSelf: "center",
    marginBottom: SPACING.md,
  },
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
