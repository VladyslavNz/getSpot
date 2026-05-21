// Reusable glass card with frosted blur, soft border and shadow
import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { BlurView } from "expo-blur";
import { COLORS, RADII, SHADOWS } from "../theme";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  radius?: number;
  tint?: "light" | "default" | "extraLight";
  noShadow?: boolean;
  testID?: string;
};

export default function GlassCard({
  children,
  style,
  intensity = 55,
  radius = RADII.lg,
  tint = "light",
  noShadow = false,
  testID,
}: Props) {
  return (
    <View
      testID={testID}
      style={[
        styles.shadow,
        { borderRadius: radius },
        noShadow && { shadowOpacity: 0, elevation: 0 },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[styles.blur, { borderRadius: radius }]}
      >
        <View style={[styles.inner, { borderRadius: radius }]}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    ...SHADOWS.md,
    backgroundColor: "transparent",
  },
  blur: {
    overflow: "hidden",
    backgroundColor: COLORS.glassLight,
  },
  inner: {
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
});
