// Circular pin marker for Places
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Polygon, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { MapPin } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../theme';

const PLACE_CORAL = '#E07A8B';
const CIRCLE_R = 17; // 34 / 2
const TAIL_H = 8;
const MARKER_W = 34;
const MARKER_H = MARKER_W + TAIL_H; // 42
const GLOW_SIZE = 50;
const CLUSTER_W = 40;
const CLUSTER_R = 20;
const CLUSTER_H = CLUSTER_W + TAIL_H; // 48
const BORDER_W = 2;
const BADGE_SIZE = 18;

interface PlaceMarkerProps {
  active?: boolean;
  count?: number;
}

/**
 * Builds an SVG pin shape: circle at the top + triangular tail pointing down.
 * Returns the component contents to render inside an <Svg>.
 */
function PinShape({
  w,
  r,
  h,
  fill,
  stroke,
  strokeW,
}: {
  w: number;
  r: number;
  h: number;
  fill: string;
  stroke: string;
  strokeW: number;
}) {
  const cx = w / 2;
  const cy = r + 1; // 1px inset from top for border
  // Tail triangle vertices
  const tailLeftX = cx - 6;
  const tailRightX = cx + 6;
  const tailTopY = cy + r - 4; // overlap with the circle slightly
  const tailBottomY = h;
  const tailPts = `${tailLeftX},${tailTopY} ${cx},${tailBottomY} ${tailRightX},${tailTopY}`;

  return (
    <>
      {/* Tail triangle (rendered first so circle covers the join) */}
      <Polygon
        points={tailPts}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      />
      {/* Circle body */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeW}
      />
    </>
  );
}

export default function PlaceMarker({ active = false, count }: PlaceMarkerProps) {
  const isCluster = count != null;
  const w = isCluster ? CLUSTER_W : MARKER_W;
  const h = isCluster ? CLUSTER_H : MARKER_H;
  const r = isCluster ? CLUSTER_R : CIRCLE_R;
  const glowSz = isCluster ? GLOW_SIZE + 8 : GLOW_SIZE;
  const scale = active ? 1.15 : 1;
  const glowOpacity = active ? 0.28 : 0.15;
  const iconSize = isCluster ? 13 : 16;

  return (
    <View
      accessibilityLabel="Place marker"
      accessibilityRole="image"
      style={[
        styles.root,
        { width: glowSz, height: glowSz, transform: [{ scale }] },
      ]}
    >
      {/* Radial warm glow */}
      <Svg
        width={glowSz}
        height={glowSz}
        viewBox={`0 0 ${glowSz} ${glowSz}`}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <RadialGradient id="placeGlow" cx="50%" cy="42%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={PLACE_CORAL} stopOpacity={glowOpacity} />
            <Stop offset="100%" stopColor={PLACE_CORAL} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={glowSz} height={glowSz} fill="url(#placeGlow)" />
      </Svg>

      {/* Pin marker body */}
      <View style={[styles.markerBody, SHADOWS.sm, { width: w, height: h }]}>
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* White border layer */}
          <PinShape w={w} r={r} h={h} fill="#FFFFFF" stroke="#FFFFFF" strokeW={BORDER_W * 2} />
          {/* Coral fill */}
          <PinShape w={w} r={r} h={h} fill={PLACE_CORAL} stroke="#FFFFFF" strokeW={BORDER_W} />
        </Svg>

        {/* Centered content */}
        <View style={[styles.content, { width: w, height: w }]}>
          {isCluster ? (
            <Text style={styles.countText}>{count! > 99 ? '99+' : count}</Text>
          ) : (
            <MapPin size={iconSize} color="#FFFFFF" strokeWidth={2.5} />
          )}
        </View>
      </View>

      {/* Cluster badge – small MapPin icon in top-right */}
      {isCluster && (
        <View style={[styles.badge, SHADOWS.sm]}>
          <MapPin size={10} color="#FFFFFF" strokeWidth={2.5} />
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
    top: 2,
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
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
    top: 0,
    right: 0,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: PLACE_CORAL,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
