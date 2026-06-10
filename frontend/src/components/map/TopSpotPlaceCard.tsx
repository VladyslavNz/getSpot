// TopSpotPlaceCard — premium card for a Place in the Top Spots bottom sheet list
import React, { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Star, MapPin } from 'lucide-react-native';
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from '../../theme';
import type { Spot } from '../../api';

/* ─── Props ──────────────────────────────────────────────────────── */
type Props = {
  place: Spot;
  isSelected: boolean;
  onPress: () => void;
};

/* ─── Helpers ────────────────────────────────────────────────────── */
/** Return 1–2 compact tag labels derived from the category */
function deriveTags(category: string): string[] {
  const base = category.trim();
  if (!base) return [];
  // Return the primary category; add a contextual second tag when recognisable
  const SECONDARY: Record<string, string> = {
    restaurant: 'Dining',
    cafe: 'Coffee',
    bar: 'Nightlife',
    club: 'Nightlife',
    park: 'Outdoor',
    gym: 'Fitness',
    museum: 'Culture',
    gallery: 'Art',
    hotel: 'Stay',
    beach: 'Outdoor',
    spa: 'Wellness',
    bakery: 'Food',
    shop: 'Shopping',
  };
  const key = base.toLowerCase();
  const second = SECONDARY[key];
  return second ? [base, second] : [base];
}

/* ─── Component ──────────────────────────────────────────────────── */
function TopSpotPlaceCard({ place, isSelected, onPress }: Props) {
  const handlePress = useCallback(() => onPress(), [onPress]);
  const tags = deriveTags(place.category);

  return (
    <TouchableOpacity
      testID={`topspot-place-${place.id}`}
      activeOpacity={0.82}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View ${place.name}`}
      style={[styles.card, isSelected && styles.cardSelected]}
    >
      {/* ── Left: Hero image with category badge ───────────── */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: place.image }}
          style={styles.heroImage}
          accessibilityLabel={`${place.name} photo`}
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText} numberOfLines={1}>
            {place.category}
          </Text>
        </View>
      </View>

      {/* ── Right: Content ─────────────────────────────────── */}
      <View style={styles.body}>
        {/* Name */}
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>

        {/* Rating row */}
        <View style={styles.ratingRow}>
          <Star
            size={12}
            color={COLORS.gold}
            fill={COLORS.gold}
            strokeWidth={1.8}
          />
          <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.categoryText} numberOfLines={1}>
            {place.category}
          </Text>
        </View>

        {/* Address row */}
        <View style={styles.metaRow}>
          <MapPin size={11} color={COLORS.textSecondary} strokeWidth={2} />
          <Text style={styles.metaText} numberOfLines={1}>
            {place.address}
          </Text>
        </View>

        {/* Distance */}
        {place.distance_km != null && (
          <Text style={styles.distanceText}>
            {place.distance_km} km away
          </Text>
        )}

        {/* Tags row */}
        {tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(TopSpotPlaceCard);

/* ─── Styles ─────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  cardSelected: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.blue,
    backgroundColor: COLORS.bgAlt,
    ...SHADOWS.md,
  },

  /* Hero image */
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: RADII.md,
    overflow: 'hidden',
  },
  heroImage: {
    width: 80,
    height: 80,
    borderRadius: RADII.md,
    backgroundColor: COLORS.cream,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADII.pill,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  categoryBadgeText: {
    fontSize: 8,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  /* Body */
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },

  /* Name */
  name: {
    ...TYPE.h3,
    fontSize: 15,
    lineHeight: 20,
  },

  /* Rating row */
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: COLORS.text,
    letterSpacing: -0.1,
  },
  dot: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginHorizontal: 1,
  },
  categoryText: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    flex: 1,
  },

  /* Meta row (address) */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },

  /* Distance */
  distanceText: {
    ...TYPE.caption,
    fontSize: 10,
    color: COLORS.blue,
    fontWeight: '600' as const,
  },

  /* Tags */
  tagsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.pill,
    backgroundColor: 'rgba(20,40,80,0.05)',
  },
  tagText: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    letterSpacing: 0.2,
  },
});
