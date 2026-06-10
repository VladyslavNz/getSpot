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
import { Layers, MapPin, Calendar, Check } from "lucide-react-native";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../theme";

const { height: SCREEN_H } = Dimensions.get("window");
const DRAG_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.5;

type MapContentFilter = "all" | "events" | "places";

type Props = {
  visible: boolean;
  value: MapContentFilter;
  onChange: (key: MapContentFilter) => void;
  onClose: () => void;
};

const OPTIONS = [
  { key: "all", label: "All Content", Icon: Layers, tint: COLORS.text },
  { key: "events", label: "Events Only", Icon: Calendar, tint: COLORS.blue },
  { key: "places", label: "Places Only", Icon: MapPin, tint: "#E07A8B" },
] as const;

export default function MapContentFilterSheet({ visible, value, onChange, onClose }: Props) {
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

  const handleSelect = (key: MapContentFilter) => {
    onChange(key);
    closeSheet(onClose);
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
            <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
        >
          <View {...panResponder.panHandlers} style={styles.dragArea}>
            <View style={styles.handle} />
          </View>

          <View style={styles.body}>
            <Text style={styles.title}>Filter Map Content</Text>

            <View style={styles.list}>
              {OPTIONS.map((opt) => {
                const active = value === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    testID={`filter-${opt.key}`}
                    activeOpacity={0.8}
                    onPress={() => handleSelect(opt.key)}
                    style={[styles.row, active && styles.rowActive]}
                  >
                    <View style={[styles.iconBox, { backgroundColor: `${opt.tint}14` }]}>
                      <opt.Icon size={18} color={opt.tint} strokeWidth={2.2} />
                    </View>
                    <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                      {opt.label}
                    </Text>
                    {active && <Check size={18} color={COLORS.blue} strokeWidth={2.6} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={styles.footerSpacer} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(20,30,50,0.3)" },

  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: RADII.xxl,
    borderTopRightRadius: RADII.xxl,
    ...SHADOWS.lg,
  },
  dragArea: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: "center",
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(20,40,80,0.12)",
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 4,
    paddingBottom: SPACING.xl,
  },
  title: {
    ...TYPE.h3,
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  list: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: RADII.md,
    backgroundColor: "rgba(20,40,80,0.02)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  rowActive: {
    backgroundColor: "rgba(109,148,197,0.08)",
    borderColor: "rgba(109,148,197,0.25)",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { ...TYPE.bodyMed, fontSize: 15, flex: 1, color: COLORS.text },
  rowLabelActive: { color: COLORS.blue, fontWeight: "700" },
  footerSpacer: { height: 24, backgroundColor: "#FFFFFF" },
});
