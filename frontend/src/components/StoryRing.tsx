// Story ring with gradient border
import React from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SPACING } from "../theme";

type Props = {
  avatar: string;
  name: string;
  viewed?: boolean;
  size?: number;
  onPress?: () => void;
  testID?: string;
};

export default function StoryRing({ avatar, name, viewed, size = 64, onPress, testID }: Props) {
  const colors = viewed
    ? ["#E0DCD3", "#D2CFC6"] as const
    : ["#6D94C5", "#CBDCEB", "#C9A24B"] as const;

  return (
    <TouchableOpacity testID={testID} onPress={onPress} activeOpacity={0.85} style={styles.wrap}>
      <LinearGradient colors={colors} style={[styles.ring, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]}>
        <View style={[styles.inner, { width: size + 2, height: size + 2, borderRadius: (size + 2) / 2 }]}>
          <Image source={{ uri: avatar }} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />
        </View>
      </LinearGradient>
      <Text numberOfLines={1} style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", marginRight: SPACING.md, width: 72 },
  ring: { alignItems: "center", justifyContent: "center" },
  inner: { backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" },
  avatar: {},
  name: { marginTop: 6, fontSize: 11, color: COLORS.text, fontWeight: "500", maxWidth: 70, textAlign: "center" },
});
