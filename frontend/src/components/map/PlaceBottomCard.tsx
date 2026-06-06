// PlaceBottomCard — glassmorphism card shown when a place marker is tapped
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  X,
  Star,
  MapPin,
  ArrowRight,
} from 'lucide-react-native';
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from '../../theme';
import type { Spot } from '../../api';

/* ─── Props ──────────────────────────────────────────────────────── */
interface PlaceBottomCardProps {
  place: Spot;
  onClose: () => void;
  onViewPlace: (id: string) => void;
}

/* ─── Component ──────────────────────────────────────────────────── */
export default function PlaceBottomCard({
  place,
  onClose,
  onViewPlace,
}: PlaceBottomCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.shadowContainer}>
        <BlurView intensity={75} tint="light" style={styles.blur}>
          <View style={styles.card}>
            {/* ── Left: Thumbnail ─────────────────────────────── */}
            <Image
              source={{ uri: place.image }}
              style={styles.thumb}
              accessibilityLabel={`${place.name} photo`}
            />

            {/* ── Right: Content ──────────────────────────────── */}
            <View style={styles.body}>
              {/* Row 1 — Name + close */}
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {place.name}
                </Text>
                <TouchableOpacity
                  testID="place-bottom-close"
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.closeBtn}
                  accessibilityLabel="Close card"
                  accessibilityRole="button"
                >
                  <X size={14} color={COLORS.textTertiary} strokeWidth={2.4} />
                </TouchableOpacity>
              </View>

              {/* Row 2 — Category chip */}
              <View style={styles.chipRow}>
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryLabel}>
                    {place.category}
                  </Text>
                </View>
              </View>

              {/* Row 3 — Rating + distance */}
              <View style={styles.ratingRow}>
                <Star
                  size={12}
                  color={COLORS.gold}
                  fill={COLORS.gold}
                  strokeWidth={1.8}
                />
                <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                <Text style={styles.dot}>·</Text>
                <MapPin size={11} color={COLORS.textSecondary} strokeWidth={2} />
                <Text style={styles.distanceText}>
                  {place.distance_km != null
                    ? `${place.distance_km} km`
                    : place.address}
                </Text>
              </View>

              {/* Row 4 — Description */}
              {place.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {place.description}
                </Text>
              ) : null}

              {/* Row 5 — View button */}
              <TouchableOpacity
                testID={`place-view-${place.id}`}
                activeOpacity={0.85}
                onPress={() => onViewPlace(place.id)}
                style={styles.btnPrimary}
                accessibilityRole="button"
                accessibilityLabel="View place details"
              >
                <Text style={styles.btnPrimaryLabel}>View Place</Text>
                <ArrowRight size={13} color="#FFF" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */
const ROSE = '#E07A8B';

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    top: '50%',
    transform: [{ translateY: -80 }],
    zIndex: 100,
  },
  shadowContainer: {
    ...SHADOWS.lg,
    borderRadius: RADII.xl,
  },
  blur: {
    borderRadius: RADII.xl,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    gap: SPACING.md,
  },

  /* Thumbnail */
  thumb: {
    width: 84,
    height: 100,
    borderRadius: RADII.md,
    backgroundColor: COLORS.cream,
  },

  /* Body */
  body: {
    flex: 1,
    justifyContent: 'space-between',
  },

  /* Row 1 */
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    color: COLORS.text,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Row 2 — Category */
  chipRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADII.pill,
    backgroundColor: 'rgba(20,40,80,0.06)',
  },
  categoryLabel: {
    ...TYPE.caption,
    fontSize: 10,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },

  /* Row 3 — Rating / distance */
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
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
    marginHorizontal: 2,
  },
  distanceText: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
  },

  /* Row 4 — Description */
  description: {
    ...TYPE.small,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },

  /* Row 5 — Button */
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: RADII.pill,
    backgroundColor: ROSE,
    marginTop: SPACING.sm,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  btnPrimaryLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFF',
    letterSpacing: 0.1,
  },
});
