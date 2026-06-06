// Floating segmented filter control for the map — All / Events / Places
import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Calendar, MapPin, Layers } from 'lucide-react-native';
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from '../../theme';

// ── Types ────────────────────────────────────────────────────────────────────
export type MapFilterMode = 'all' | 'events' | 'places';

interface MapSegmentedFilterProps {
  activeFilter: MapFilterMode;
  onFilterChange: (filter: MapFilterMode) => void;
  eventCount?: number;
  placeCount?: number;
}

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Segment accent colours ───────────────────────────────────────────────────
const SEGMENT_ACCENT: Record<MapFilterMode, string> = {
  all: COLORS.text,
  events: COLORS.blue,
  places: '#E07A8B',
};

const BADGE_BG: Record<string, string> = {
  events: COLORS.blue,
  places: '#E07A8B',
};

// ── Segment metadata ─────────────────────────────────────────────────────────
interface SegmentConfig {
  key: MapFilterMode;
  label: string;
  Icon: typeof Layers;
  testID: string;
}

const SEGMENTS: SegmentConfig[] = [
  { key: 'all', label: 'All', Icon: Layers, testID: 'filter-all' },
  { key: 'events', label: 'Events', Icon: Calendar, testID: 'filter-events' },
  { key: 'places', label: 'Places', Icon: MapPin, testID: 'filter-places' },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function MapSegmentedFilter({
  activeFilter,
  onFilterChange,
  eventCount,
  placeCount,
}: MapSegmentedFilterProps) {
  const handlePress = useCallback(
    (filter: MapFilterMode) => {
      if (filter === activeFilter) return;
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          220,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity,
        ),
      );
      onFilterChange(filter);
    },
    [activeFilter, onFilterChange],
  );

  const getCount = (key: MapFilterMode): number | undefined => {
    if (key === 'events') return eventCount;
    if (key === 'places') return placeCount;
    return undefined;
  };

  return (
    <View style={styles.outerShadow}>
      <BlurView intensity={70} tint="light" style={styles.blurWrap}>
        <View style={styles.container}>
          {SEGMENTS.map((seg) => {
            const active = seg.key === activeFilter;
            const iconColor = active
              ? SEGMENT_ACCENT[seg.key]
              : COLORS.textSecondary;
            const textColor = active ? COLORS.text : COLORS.textSecondary;
            const count = getCount(seg.key);

            return (
              <TouchableOpacity
                key={seg.key}
                testID={seg.testID}
                activeOpacity={0.75}
                onPress={() => handlePress(seg.key)}
                style={[
                  styles.segment,
                  active && styles.segmentActive,
                ]}
              >
                <seg.Icon size={16} color={iconColor} strokeWidth={2.2} />

                <Text
                  style={[
                    styles.segmentLabel,
                    { color: textColor },
                    active && styles.segmentLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {seg.label}
                </Text>

                {typeof count === 'number' && count > 0 && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: BADGE_BG[seg.key] ?? COLORS.textSecondary },
                    ]}
                  >
                    <Text style={styles.badgeText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerShadow: {
    ...SHADOWS.md,
    borderRadius: RADII.pill,
    alignSelf: 'center',
  },
  blurWrap: {
    borderRadius: RADII.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
    height: 44,
  },

  // ── Segment ──
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.pill,
    gap: 5,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },

  // ── Label ──
  segmentLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: -0.1,
  },
  segmentLabelActive: {
    fontWeight: '600' as const,
  },

  // ── Count badge ──
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
