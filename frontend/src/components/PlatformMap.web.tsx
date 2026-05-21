// Web variant — stylized Apple-like map background (no react-native-maps)
import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";

const WEB_MAP_BG =
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80";

export default function PlatformMap(props: any) {
  return (
    <View style={[styles.bg, props.style]}>
      <ImageBackground
        source={{ uri: WEB_MAP_BG }}
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: 0.18 }}
      />
      <View style={styles.tint} pointerEvents="none" />
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#EFE9DC", overflow: "hidden" },
  tint: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(245,242,235,0.4)" },
});
