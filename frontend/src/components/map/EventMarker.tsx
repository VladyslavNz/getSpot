// Hexagonal map marker for Events
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Defs, RadialGradient, Stop, Circle as SvgCircle, Rect } from 'react-native-svg';
import { Calendar } from 'lucide-react-native';
import { COLORS, SHADOWS, SPACING } from '../../theme';

const EVENT_BLUE = COLORS.blue; // #6D94C5
const MARKER_W = 38;
const MARKER_H = 42;
const GLOW_SIZE = 56;
const CLUSTER_W = 44;
const CLUSTER_H = 48;
const BORDER_W = 2;
const BADGE_SIZE = 18;

interface EventMarkerProps {
  active?: boolean;
  count?: number;
}

/**
 * Generates flat-top hexagon points centered in a viewBox,
 * plus a small downward-pointing tail triangle.
 */
function hexPoints(w: number, h: number): string {
  // Hexagon body occupies the top portion; tail occupies the bottom ~6px
  const bodyH = h - 6;
  const cx = w / 2;
  const cy = bodyH / 2;
  const rx = w / 2 - 1; // slight inset so stroke doesn't clip
  const ry = bodyH / 2 - 1;

  // flat-top hexagon vertices (6 points)
  const pts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    pts.push([cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)]);
  }

  // Tail: small triangle extending from bottom two hex vertices to a point below
  const bottomLeft = pts[4]; // ~bottom-left vertex
  const bottomRight = pts[2]; // ~bottom-right vertex
  const tailTip: [number, number] = [cx, h];

  // We build a single polygon: hex vertices + tail vertices inserted between
  // bottom-left and bottom-right
  // Order: top-right → bottom-right → tail-right-anchor → tail-tip → tail-left-anchor → bottom-left → top-left
  // With flat-top hex (starting at 0°): 0=right, 1=bottom-right, 2=bottom-left... wait
  // Let's recalculate for a proper flat-top hex starting from the right vertex going clockwise:
  // i=0 → right (3 o'clock)
  // i=1 → bottom-right
  // i=2 → bottom-left
  // i=3 → left (9 o'clock)
  // i=4 → top-left
  // i=5 → top-right

  // We want the tail between bottom-right (i=1) and bottom-left (i=2)
  const tailAnchorRight: [number, number] = [cx + 5, pts[1][1]];
  const tailAnchorLeft: [number, number] = [cx - 5, pts[2][1]];

  // Build full polygon: 0→1→tailAnchorRight→tailTip→tailAnchorLeft→2→3→4→5
  const allPts: [number, number][] = [
    pts[0],
    pts[1],
    tailAnchorRight,
    tailTip,
    tailAnchorLeft,
    pts[2],
    pts[3],
    pts[4],
    pts[5],
  ];

  return allPts.map(([x, y]) => `${x},${y}`).join(' ');
}

export default function EventMarker({ active = false, count }: EventMarkerProps) {
  const isCluster = count != null;
  const w = isCluster ? CLUSTER_W : MARKER_W;
  const h = isCluster ? CLUSTER_H : MARKER_H;
  const glowSz = isCluster ? GLOW_SIZE + 8 : GLOW_SIZE;
  const scale = active ? 1.15 : 1;
  const glowOpacity = active ? 0.35 : 0.2;
  const iconSize = isCluster ? 14 : 18;

  return (
    <View
      accessibilityLabel="Event marker"
      accessibilityRole="image"
      style={[
        styles.root,
        { width: glowSz, height: glowSz, transform: [{ scale }] },
      ]}
    >
      {/* Radial glow behind marker */}
      <Svg
        width={glowSz}
        height={glowSz}
        viewBox={`0 0 ${glowSz} ${glowSz}`}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <RadialGradient id="eventGlow" cx="50%" cy="45%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={EVENT_BLUE} stopOpacity={glowOpacity} />
            <Stop offset="100%" stopColor={EVENT_BLUE} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={glowSz} height={glowSz} fill="url(#eventGlow)" />
      </Svg>

      {/* Hexagon marker body */}
      <View style={[styles.markerBody, SHADOWS.md, { width: w, height: h }]}>
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* White border (slightly larger stroke) */}
          <Polygon
            points={hexPoints(w, h)}
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth={BORDER_W * 2}
            strokeLinejoin="round"
          />
          {/* Blue fill */}
          <Polygon
            points={hexPoints(w, h)}
            fill={EVENT_BLUE}
            stroke="#FFFFFF"
            strokeWidth={BORDER_W}
            strokeLinejoin="round"
          />
        </Svg>

        {/* Centered content (icon or count) */}
        <View style={[styles.content, { width: w, height: h - 6 }]}>
          {isCluster ? (
            <Text style={styles.countText}>{count! > 99 ? '99+' : count}</Text>
          ) : (
            <Calendar size={iconSize} color="#FFFFFF" strokeWidth={2.5} />
          )}
        </View>
      </View>

      {/* Cluster badge – small Calendar icon in top-right */}
      {isCluster && (
        <View style={[styles.badge, SHADOWS.sm]}>
          <Calendar size={10} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerBody: {
    position: 'absolute',
    alignSelf: 'center',
    top: 4,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: EVENT_BLUE,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
