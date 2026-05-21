// Horizontal pill chip selector
import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { COLORS, RADII, SPACING } from "../theme";

type Props = {
  options: { label: string; key: string; count?: number }[];
  value: string;
  onChange: (key: string) => void;
  testID?: string;
};

export default function PillChips({ options, value, onChange, testID }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      testID={testID}
    >
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <TouchableOpacity
            key={opt.key}
            testID={`chip-${opt.key}`}
            activeOpacity={0.85}
            onPress={() => onChange(opt.key)}
            style={styles.shadowWrap}
          >
            {active ? (
              <View style={[styles.chip, styles.chipActive]}>
                <Text style={[styles.label, styles.labelActive]}>{opt.label}</Text>
                {typeof opt.count === "number" && (
                  <Text style={[styles.count, styles.countActive]}>{opt.count}</Text>
                )}
              </View>
            ) : (
              <BlurView intensity={50} tint="light" style={styles.chip}>
                <Text style={styles.label}>{opt.label}</Text>
                {typeof opt.count === "number" && <Text style={styles.count}>{opt.count}</Text>}
              </BlurView>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: SPACING.lg, gap: 8, alignItems: "center" },
  shadowWrap: {
    marginRight: 8,
    borderRadius: RADII.pill,
    shadowColor: "#1A3252",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  chipActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  label: { fontSize: 14, fontWeight: "500", color: COLORS.text, letterSpacing: -0.2 },
  labelActive: { color: "#FFF", fontWeight: "600" },
  count: {
    fontSize: 12,
    marginLeft: 6,
    color: COLORS.textSecondary,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  countActive: { color: COLORS.text, backgroundColor: "rgba(255,255,255,0.9)" },
});
