// EventBottomCard — glassmorphism card shown when an event marker is tapped
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
  Calendar,
  MapPin,
  Users,
  ArrowRight,
} from 'lucide-react-native';
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from '../../theme';
import type { Event } from '../../api';

/* ─── Mock avatars for participant stack ──────────────────────────── */
const MOCK_AVATARS = [
  'https://images.unsplash.com/photo-1758600435913-c45b319745ca?crop=entropy&cs=srgb&fm=jpg&w=100&q=80',
  'https://images.unsplash.com/photo-1758874384842-7e79ce77ed1a?crop=entropy&cs=srgb&fm=jpg&w=100&q=80',
  'https://images.unsplash.com/photo-1737599819881-df2553a821ad?crop=entropy&cs=srgb&fm=jpg&w=100&q=80',
];

/* ─── Props ──────────────────────────────────────────────────────── */
interface EventBottomCardProps {
  event: Event;
  onClose: () => void;
  onViewEvent: (id: string) => void;
  onJoinEvent: (id: string) => void;
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / 86_400_000);
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diffDays === 0) return `Today · ${time}`;
    if (diffDays === 1) return `Tomorrow · ${time}`;
    const day = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    return `${day} · ${time}`;
  } catch {
    return iso;
  }
}

/* ─── Component ──────────────────────────────────────────────────── */
export default function EventBottomCard({
  event,
  onClose,
  onViewEvent,
  onJoinEvent,
}: EventBottomCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.shadowContainer}>
        <BlurView intensity={75} tint="light" style={styles.blur}>
          <View style={styles.card}>
            {/* ── Left: Thumbnail ─────────────────────────────── */}
            <Image
              source={{ uri: event.image }}
              style={styles.thumb}
              accessibilityLabel={`${event.title} event image`}
            />

            {/* ── Right: Content ──────────────────────────────── */}
            <View style={styles.body}>
              {/* Row 1 — Title + close */}
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {event.title}
                </Text>
                <TouchableOpacity
                  testID="event-bottom-close"
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.closeBtn}
                  accessibilityLabel="Close card"
                  accessibilityRole="button"
                >
                  <X size={14} color={COLORS.textTertiary} strokeWidth={2.4} />
                </TouchableOpacity>
              </View>

              {/* Row 2 — Date / time */}
              <View style={styles.metaRow}>
                <Calendar size={11} color={COLORS.textSecondary} strokeWidth={2} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {formatDate(event.date)}
                </Text>
              </View>

              {/* Row 3 — Distance */}
              <View style={styles.metaRow}>
                <MapPin size={11} color={COLORS.textSecondary} strokeWidth={2} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {event.distance_km} km away
                </Text>
              </View>

              {/* Row 4 — Participants */}
              <View style={styles.participantRow}>
                <Users size={11} color={COLORS.textSecondary} strokeWidth={2} />
                <Text style={styles.metaText}>
                  {event.member_count}
                </Text>
                <View style={styles.avatarStack}>
                  {MOCK_AVATARS.map((uri, i) => (
                    <Image
                      key={i}
                      source={{ uri }}
                      style={[
                        styles.stackAvatar,
                        { marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i },
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Row 5 — Action buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  testID={`event-join-${event.id}`}
                  activeOpacity={0.85}
                  onPress={() => onJoinEvent(event.id)}
                  style={styles.btnPrimary}
                  accessibilityRole="button"
                  accessibilityLabel="Join Event"
                >
                  <Users size={12} color="#FFF" strokeWidth={2.4} />
                  <Text style={styles.btnPrimaryLabel}>Join Event</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID={`event-view-${event.id}`}
                  activeOpacity={0.85}
                  onPress={() => onViewEvent(event.id)}
                  style={styles.btnGhost}
                  accessibilityRole="button"
                  accessibilityLabel="View event details"
                >
                  <Text style={styles.btnGhostLabel}>View</Text>
                  <ArrowRight size={12} color={COLORS.text} strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */
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

  /* Meta rows */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  metaText: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
  },

  /* Participants */
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  avatarStack: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  stackAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },

  /* Buttons */
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.blue,
    shadowColor: COLORS.blue,
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
  btnGhost: {
    flex: 0.7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(20,40,80,0.08)',
  },
  btnGhostLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.text,
    letterSpacing: -0.1,
  },
});
