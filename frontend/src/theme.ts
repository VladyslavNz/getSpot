// Design tokens for GetSpot — Premium Light Glassmorphism
import { Platform } from "react-native";

export const COLORS = {
  // Brand palette
  cream: "#F5EFE6",
  beige: "#E8DFCA",
  blue: "#6D94C5",
  blueLight: "#CBDCEB",
  blueDark: "#4F75A8",

  // Backgrounds
  bg: "#F5EFE6",
  bgAlt: "#FAF6EF",
  surface: "#FFFFFF",

  // Text
  text: "#1C1C1E",
  textSecondary: "#6B6B72",
  textTertiary: "#A8A8AE",

  // Glass
  glassLight: "rgba(255,255,255,0.65)",
  glassMedium: "rgba(255,255,255,0.45)",
  glassStrong: "rgba(255,255,255,0.85)",
  glassBorder: "rgba(255,255,255,0.9)",
  glassBorderSoft: "rgba(255,255,255,0.55)",

  // Accent / semantic
  gold: "#C9A24B",
  success: "#3FB58B",
  danger: "#E5604E",
  shadow: "rgba(20,40,80,0.10)",
  shadowSoft: "rgba(20,40,80,0.06)",
  divider: "rgba(20,40,80,0.06)",
};

export const RADII = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36,
  pill: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const FONT = Platform.select({
  ios: { regular: "System", medium: "System", semibold: "System", bold: "System" },
  android: { regular: "sans-serif", medium: "sans-serif-medium", semibold: "sans-serif-medium", bold: "sans-serif" },
  default: { regular: "System", medium: "System", semibold: "System", bold: "System" },
}) as { regular: string; medium: string; semibold: string; bold: string };

export const TYPE = {
  hero: { fontSize: 34, fontWeight: "700" as const, letterSpacing: -0.6, color: COLORS.text },
  h1: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.5, color: COLORS.text },
  h2: { fontSize: 22, fontWeight: "600" as const, letterSpacing: -0.4, color: COLORS.text },
  h3: { fontSize: 18, fontWeight: "600" as const, letterSpacing: -0.3, color: COLORS.text },
  body: { fontSize: 15, fontWeight: "400" as const, letterSpacing: -0.2, color: COLORS.text },
  bodyMed: { fontSize: 15, fontWeight: "500" as const, letterSpacing: -0.2, color: COLORS.text },
  small: { fontSize: 13, fontWeight: "400" as const, letterSpacing: -0.1, color: COLORS.textSecondary },
  caption: { fontSize: 11, fontWeight: "500" as const, letterSpacing: 0.2, color: COLORS.textSecondary },
};

export const SHADOWS = {
  sm: {
    shadowColor: "#1A3252",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  md: {
    shadowColor: "#1A3252",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 22,
    elevation: 6,
  },
  lg: {
    shadowColor: "#1A3252",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 12,
  },
  glow: {
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius: 20,
    elevation: 10,
  },
};

// Apple-style map style (light, soft, minimal)
export const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#F5F2EB" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8E8E93" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#D8E8D0" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#F0E6D2" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#CBDCEB" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#6D94C5" }] },
];
