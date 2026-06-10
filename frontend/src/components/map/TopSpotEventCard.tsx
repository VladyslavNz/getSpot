// TopSpotEventCard — premium card for an Event in the Top Spots bottom sheet list
import React, { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Calendar, MapPin, Users } from 'lucide-react-native';
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from '../../theme';
import type { Event } from '../../api';

/* ─── Props ──────────────────────────────────────────────────────── */
type Props = {
  event: Event;
  isSelected: boolean;
  onPress: () => void;
};

/* ─── Helpers ────────────────────────────────────────────────────── */
function formatEventDate(iso: string): string {
  try {
    const d = new Date(iso);
    const day = d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const time = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `${day} · ${time}`;
  } catch {
    return iso;
  }
}

/** Extract the day number from an ISO date string */
function getDayNumber(iso: string): string {
  try {
    return new Date(iso).getDate().toString();
  } catch {
    return '--';
  }
}

/** Return 1–2 compact tag labels from category / event_type */
function deriveTags(category: string, eventType: string): string[] {
  const tags: string[] = [];
  if (category) tags.push(category);
  if (eventType && eventType.toLowerCase() !== category.toLowerCase()) {
    tags.push(eventType);
  }
  return tags.slice(0, 2);
}

/* ─── Component ──────────────────────────────────────────────────── */
function TopSpotEventCard({ event, isSelected, onPress }: Props) {
  const handlePress = useCallback(() => onPress(), [onPress]);
  const tags = deriveTags(event.category, event.event_type);

  return (
    <TouchableOpacity
      testID={`topspot-event-${event.id}`}
      activeOpacity={0.82}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View ${event.title}`}
      style={[styles.card, isSelected && styles.cardSelected]}
    >
      {/* ── Left: Hero image with date badge ───────────────── */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.image }}
          style={styles.heroImage}
          accessibilityLabel={`${event.title} event image`}
        />
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{getDayNumber(event.date)}</Text>
        </View>
      </View>

      {/* ── Right: Content ─────────────────────────────────── */}
      <View style={styles.body}>
        {/* Event name */}
        <Text style={styles.name} numberOfLines={1}>
          {event.title}
        </Text>

        {/* Date & time row */}
        <View style={styles.metaRow}>
          <Calendar size={11} color={COLORS.textSecondary} strokeWidth={2} />
          <Text style={styles.metaText} numberOfLines={1}>
            {formatEventDate(event.date)}
          </Text>
        </View>

        {/* Attendance badge */}
        <View style={styles.attendanceBadge}>
          <Users size={10} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.attendanceText}>
            {event.member_count} Going
          </Text>
        </View>

        {/* Location row */}
        <View style={styles.metaRow}>
          <MapPin size={11} color={COLORS.textSecondary} strokeWidth={2} />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

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

export default React.memo(TopSpotEventCard);

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
  dateBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: COLORS.text,
    letterSpacing: -0.2,
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

  /* Meta rows (date, location) */
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

  /* Attendance badge */
  attendanceBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.blue,
  },
  attendanceText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.2,
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
