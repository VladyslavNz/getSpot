// Map tab — Community Map with dual-content model: Events & Places
// Redesigned with segmented filter, distinct markers, and context-specific bottom cards
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  Dimensions,
  LayoutAnimation,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import {
  ChevronDown,
  Crosshair,
  MapPin,
  Star,
  ArrowRight,
  Search,
  Users,
  X,
  Calendar,
  Layers,
  ThumbsUp,
  SlidersHorizontal,
  Bookmark,
} from "lucide-react-native";
import Svg, { Polygon } from "react-native-svg";
import PlatformMap, { MarkerData } from "../../src/components/PlatformMap";
import { api, Spot, Event } from "../../src/api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../src/theme";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Mock avatar URLs for participant previews ────────────────────────────────
const MOCK_AVATARS = [
  "https://images.unsplash.com/photo-1758600435913-c45b319745ca?crop=entropy&cs=srgb&fm=jpg&w=100&q=80",
  "https://images.unsplash.com/photo-1758874384842-7e79ce77ed1a?crop=entropy&cs=srgb&fm=jpg&w=100&q=80",
  "https://images.unsplash.com/photo-1737599819881-df2553a821ad?crop=entropy&cs=srgb&fm=jpg&w=100&q=80",
];

// ─── Filter mode type ─────────────────────────────────────────────────────────
type MapFilterMode = "all" | "events" | "places";

// ─── Selected item union type ─────────────────────────────────────────────────
type SelectedItem =
  | { type: "event"; data: Event }
  | { type: "place"; data: Spot }
  | null;

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT MARKER — Hexagonal shape (dynamic, activity)
// ═══════════════════════════════════════════════════════════════════════════════
function EventMarkerView({ active, count }: { active?: boolean; count?: number }) {
  const size = count ? 44 : 38;
  const glowSize = size + 18;
  // Hexagon points for SVG (centered, pointy-top)
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  const hex = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");

  return (
    <View
      style={[markerStyles.eventWrap, { width: glowSize, height: glowSize + 8 }]}
      accessibilityLabel={count ? `${count} events in this area` : "Event marker"}
      accessibilityRole="button"
    >
      {/* Glow ring */}
      <View
        style={[
          markerStyles.eventGlow,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            opacity: active ? 0.28 : 0.18,
          },
        ]}
      />
      {/* Hexagon body */}
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Polygon
            points={hex}
            fill={COLORS.blue}
            stroke="#FFFFFF"
            strokeWidth={2.5}
          />
        </Svg>
        {/* Icon / count overlay */}
        <View style={[markerStyles.eventIconOverlay, { width: size, height: size }]}>
          {count ? (
            <Text style={markerStyles.clusterCount}>{count}</Text>
          ) : (
            <Calendar size={14} color="#FFF" strokeWidth={2.4} />
          )}
        </View>
      </View>
      {/* Pin tail */}
      <View style={markerStyles.eventTail} />
      {/* Cluster badge */}
      {count && (
        <View style={markerStyles.clusterBadge}>
          <Calendar size={8} color="#FFF" strokeWidth={2.6} />
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLACE MARKER — Circular pin shape (stable, location)
// ═══════════════════════════════════════════════════════════════════════════════
function PlaceMarkerView({ active, count }: { active?: boolean; count?: number }) {
  const circleSize = count ? 40 : 34;
  const glowSize = circleSize + 16;

  return (
    <View
      style={[markerStyles.placeWrap, { width: glowSize, height: glowSize + 10 }]}
      accessibilityLabel={count ? `${count} places in this area` : "Place marker"}
      accessibilityRole="button"
    >
      {/* Glow */}
      <View
        style={[
          markerStyles.placeGlow,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            opacity: active ? 0.22 : 0.14,
          },
        ]}
      />
      {/* Circle body */}
      <View
        style={[
          markerStyles.placeCircle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
          },
        ]}
      >
        {count ? (
          <Text style={markerStyles.clusterCount}>{count}</Text>
        ) : (
          <MapPin size={14} color="#FFF" strokeWidth={2.4} />
        )}
      </View>
      {/* Pin tail */}
      <View style={markerStyles.placeTail} />
      {/* Cluster badge */}
      {count && (
        <View style={[markerStyles.clusterBadge, { backgroundColor: "#E07A8B" }]}>
          <MapPin size={8} color="#FFF" strokeWidth={2.6} />
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED MARKER BOTTOM SHEET — matches image13 visual style
// ═══════════════════════════════════════════════════════════════════════════════
interface MarkerBottomSheetProps {
  selected: SelectedItem;
  onClose: () => void;
  onViewEvent: (id: string) => void;
  onJoinEvent: (id: string) => void;
  onViewPlace: (id: string) => void;
}

function MarkerBottomSheet({
  selected,
  onClose,
  onViewEvent,
  onJoinEvent,
  onViewPlace,
}: MarkerBottomSheetProps) {
  const [renderedItem, setRenderedItem] = useState<SelectedItem>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(450)).current;

  useEffect(() => {
    if (selected) {
      setRenderedItem(selected);
      setIsBookmarked(false);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 450,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && !selected) {
          setRenderedItem(null);
        }
      });
    }
  }, [selected, slideAnim]);

  if (!renderedItem) return null;

  const isEvent = renderedItem.type === "event";
  const itemData = renderedItem.data;

  // Extract shared fields
  const title = isEvent ? (itemData as Event).title : (itemData as Spot).name;
  const image = itemData.image;
  const category = itemData.category;
  const description = itemData.description;
  const distance = itemData.distance_km;

  // Formatting date for events
  const formattedDate = isEvent ? (() => {
    try {
      const d = new Date((itemData as Event).date);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = d.toDateString() === tomorrow.toDateString();
      const dayLabel = isToday ? "Today" : isTomorrow ? "Tomorrow" : d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
      const timeLabel = d.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
      return `${dayLabel} at ${timeLabel}`;
    } catch {
      return (itemData as Event).date;
    }
  })() : null;

  return (
    <Animated.View
      style={[
        cardStyles.sheetContainer,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={cardStyles.sheetShadow}>
        <BlurView intensity={80} tint="light" style={cardStyles.sheetCard}>
          {/* Drag Handle */}
          <View style={cardStyles.dragHandle} />

          {/* Hero Image Container */}
          <View style={cardStyles.heroContainer}>
            {image ? (
              <Image source={{ uri: image }} style={cardStyles.heroImage} resizeMode="cover" />
            ) : (
              <View style={cardStyles.heroImagePlaceholder}>
                {isEvent ? (
                  <Calendar size={48} color={COLORS.textTertiary} strokeWidth={1.5} />
                ) : (
                  <MapPin size={48} color={COLORS.textTertiary} strokeWidth={1.5} />
                )}
                <Text style={cardStyles.placeholderText}>No Image Available</Text>
              </View>
            )}

            {/* Overlaid Action Buttons (Bookmark & Close) */}
            <View style={cardStyles.overlayButtons}>
              <TouchableOpacity
                style={cardStyles.overlayCircleBtn}
                activeOpacity={0.8}
                onPress={() => setIsBookmarked(!isBookmarked)}
                accessibilityLabel={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                <Bookmark
                  size={18}
                  color={isBookmarked ? COLORS.gold : COLORS.text}
                  fill={isBookmarked ? COLORS.gold : "transparent"}
                  strokeWidth={2}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={cardStyles.overlayCircleBtn}
                activeOpacity={0.8}
                onPress={onClose}
                accessibilityLabel="Close information card"
                testID={isEvent ? "close-event-card" : "close-place-card"}
              >
                <X size={18} color={COLORS.text} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Area */}
          <ScrollView
            style={cardStyles.scrollContent}
            contentContainerStyle={cardStyles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Category Tag */}
            <View style={cardStyles.categoryRow}>
              <View style={[
                cardStyles.categoryIconBg,
                { backgroundColor: isEvent ? "rgba(109,148,197,0.12)" : "rgba(224,122,139,0.12)" }
              ]}>
                {isEvent ? (
                  <Calendar size={12} color={COLORS.blue} strokeWidth={2.4} />
                ) : (
                  <MapPin size={12} color="#E07A8B" strokeWidth={2.4} />
                )}
              </View>
              <Text style={[cardStyles.categoryText, { color: isEvent ? COLORS.blue : "#E07A8B" }]}>
                {category || (isEvent ? "Event" : "Place")}
              </Text>
            </View>

            {/* Title */}
            <Text style={cardStyles.sheetTitle} numberOfLines={2}>
              {title}
            </Text>

            {/* Address / Location Name (hierarchy matching image13) */}
            <View style={cardStyles.locationRow}>
              <MapPin size={13} color={COLORS.textSecondary} strokeWidth={2} />
              <Text style={cardStyles.locationText} numberOfLines={1}>
                {isEvent ? (itemData as Event).location : (itemData as Spot).address}
              </Text>
            </View>

            {/* Distance / Metadata Row */}
            <View style={cardStyles.detailsRow}>
              {distance != null && (
                <Text style={cardStyles.distanceText}>
                  {distance.toFixed(1)} km away
                </Text>
              )}

              {/* Specific metadata for events */}
              {isEvent && formattedDate && (
                <>
                  <Text style={cardStyles.dotSeparator}>·</Text>
                  <Text style={cardStyles.dateText} numberOfLines={1}>
                    {formattedDate}
                  </Text>
                </>
              )}

              {/* Specific metadata for places */}
              {!isEvent && (itemData as Spot).rating != null && (
                <>
                  <Text style={cardStyles.dotSeparator}>·</Text>
                  <View style={cardStyles.ratingWrap}>
                    <Star size={11} color={COLORS.gold} fill={COLORS.gold} />
                    <Text style={cardStyles.ratingText}>
                      {(itemData as Spot).rating.toFixed(1)}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Participant Stack for Events */}
            {isEvent && (
              <View style={cardStyles.eventSocialRow}>
                <View style={cardStyles.avatarStack}>
                  {MOCK_AVATARS.slice(0, 3).map((uri, i) => (
                    <Image
                      key={i}
                      source={{ uri }}
                      style={[
                        cardStyles.avatar,
                        { marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i },
                      ]}
                    />
                  ))}
                </View>
                <Text style={cardStyles.eventSocialText}>
                  {(itemData as Event).member_count} going
                </Text>
              </View>
            )}

            {/* Recommendation Tag for Places */}
            {!isEvent && (itemData as Spot).recommendation_count != null && (
              <View style={cardStyles.placeSocialRow}>
                <ThumbsUp size={12} color="#E07A8B" strokeWidth={2} />
                <Text style={cardStyles.placeSocialText}>
                  {(itemData as Spot).recommendation_count} recommendations
                </Text>
              </View>
            )}

            {/* Short Description */}
            {description ? (
              <Text style={cardStyles.sheetDescription} numberOfLines={2}>
                {description}
              </Text>
            ) : null}
          </ScrollView>

          {/* Divider */}
          <View style={cardStyles.divider} />

          {/* Primary Action Section */}
          <View style={cardStyles.actionSection}>
            {isEvent ? (
              <View style={cardStyles.buttonGroup}>
                <TouchableOpacity
                  style={cardStyles.joinBtn}
                  activeOpacity={0.85}
                  onPress={() => onJoinEvent((itemData as Event).id)}
                  testID="join-event-btn"
                >
                  <Users size={14} color="#FFF" strokeWidth={2.4} />
                  <Text style={cardStyles.joinBtnLabel}>Join Event</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={cardStyles.viewBtn}
                  activeOpacity={0.85}
                  onPress={() => onViewEvent((itemData as Event).id)}
                  testID="view-event-btn"
                >
                  <Text style={cardStyles.viewBtnLabel}>View Details</Text>
                  <ArrowRight size={14} color={COLORS.blue} strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={cardStyles.placeActionBtn}
                activeOpacity={0.85}
                onPress={() => onViewPlace((itemData as Spot).id)}
                testID="view-place-btn"
              >
                <Text style={cardStyles.placeActionBtnLabel}>View Place Details</Text>
                <ArrowRight size={14} color="#FFF" strokeWidth={2.4} />
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </View>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEGMENTED FILTER — [ All ] [ Events ] [ Places ]
// ═══════════════════════════════════════════════════════════════════════════════
function MapSegmentedFilter({
  activeFilter,
  onFilterChange,
  eventCount,
  placeCount,
}: {
  activeFilter: MapFilterMode;
  onFilterChange: (f: MapFilterMode) => void;
  eventCount?: number;
  placeCount?: number;
}) {
  const segments: { key: MapFilterMode; label: string; Icon: any; badgeCount?: number; badgeColor: string }[] = [
    { key: "all", label: "All", Icon: Layers, badgeColor: COLORS.text },
    { key: "events", label: "Events", Icon: Calendar, badgeCount: eventCount, badgeColor: COLORS.blue },
    { key: "places", label: "Places", Icon: MapPin, badgeCount: placeCount, badgeColor: "#E07A8B" },
  ];

  const handlePress = (key: MapFilterMode) => {
    if (Platform.OS !== "web") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    onFilterChange(key);
  };

  return (
    <View style={filterStyles.outerShadow}>
      <BlurView intensity={70} tint="light" style={filterStyles.container}>
        {segments.map((seg) => {
          const active = activeFilter === seg.key;
          return (
            <TouchableOpacity
              key={seg.key}
              testID={`filter-${seg.key}`}
              activeOpacity={0.85}
              onPress={() => handlePress(seg.key)}
              style={[filterStyles.segment, active && filterStyles.segmentActive]}
            >
              <seg.Icon
                size={14}
                color={active ? seg.badgeColor : COLORS.textSecondary}
                strokeWidth={2.2}
              />
              <Text style={[filterStyles.segLabel, active && { color: COLORS.text, fontWeight: "700" as const }]}>
                {seg.label}
              </Text>
              {seg.badgeCount != null && seg.badgeCount > 0 && (
                <View style={[filterStyles.badge, { backgroundColor: seg.badgeColor }]}>
                  <Text style={filterStyles.badgeText}>{seg.badgeCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN MAP SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Data state
  const [spots, setSpots] = useState<Spot[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<SelectedItem>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<MapFilterMode>("all");
  const [city, setCity] = useState("Gdańsk");
  const [distance, setDistance] = useState("10");

  // Load data
  useEffect(() => {
    (async () => {
      const [s, e] = await Promise.all([api.spots(), api.events()]);
      setSpots(s);
      setEvents(e);
    })();
  }, []);

  // Filtered data based on active filter
  const filteredEvents = useMemo(() => {
    if (activeFilter === "places") return [];
    if (query.trim()) {
      return events.filter((e) =>
        e.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    return events;
  }, [events, activeFilter, query]);

  const filteredSpots = useMemo(() => {
    if (activeFilter === "events") return [];
    if (query.trim()) {
      return spots.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    return spots;
  }, [spots, activeFilter, query]);

  // Combine markers for the map
  const allMarkers = useMemo<MarkerData[]>(() => {
    const eventMarkers: MarkerData[] = filteredEvents.map((ev) => ({
      id: ev.id,
      latitude: ev.latitude,
      longitude: ev.longitude,
      title: ev.title,
      type: "event" as const,
      onPress: () => {
        if (Platform.OS !== "web") {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        setSelectedMarker({ type: "event", data: ev });
      },
    }));
    const spotMarkers: MarkerData[] = filteredSpots.map((sp) => ({
      id: `spot-${sp.id}`,
      latitude: sp.latitude,
      longitude: sp.longitude,
      title: sp.name,
      type: "place" as const,
      onPress: () => {
        if (Platform.OS !== "web") {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        setSelectedMarker({ type: "place", data: sp });
      },
    }));
    return [...eventMarkers, ...spotMarkers];
  }, [filteredEvents, filteredSpots]);

  // Map press — deselect
  const handleMapPress = useCallback(() => {
    if (selectedMarker) {
      if (Platform.OS !== "web") {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setSelectedMarker(null);
    }
  }, [selectedMarker]);

  const handleLocateMe = useCallback(() => {
    // Center map on user location
  }, []);

  // Render custom marker based on type
  const renderMarker = useCallback((m: MarkerData) => {
    if (m.type === "event") {
      const isActive = selectedMarker?.type === "event" && selectedMarker.data.id === m.id;
      return <EventMarkerView active={isActive} />;
    }
    const spotId = m.id.replace("spot-", "");
    const isActive = selectedMarker?.type === "place" && selectedMarker.data.id === spotId;
    return <PlaceMarkerView active={isActive} />;
  }, [selectedMarker]);

  // Navigation handlers
  const handleViewEvent = useCallback((id: string) => {
    router.push(`/event/${id}` as any);
  }, [router]);

  const handleJoinEvent = useCallback((id: string) => {
    // TODO: integrate with api.toggleGoing
    router.push(`/event/${id}` as any);
  }, [router]);

  const handleViewPlace = useCallback((_id: string) => {
    router.push("/spots" as any);
  }, [router]);

  // Bottom panel items — shows relevant content based on filter
  const bottomItems = useMemo(() => {
    if (activeFilter === "events") {
      return filteredEvents.map((ev) => ({
        type: "event" as const,
        id: ev.id,
        title: ev.title,
        subtitle: (() => {
          try {
            const d = new Date(ev.date);
            return d.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
          } catch { return ""; }
        })(),
        image: ev.image,
        meta: `${ev.member_count} going`,
        metaColor: COLORS.blue,
        onPress: () => setSelectedMarker({ type: "event", data: ev }),
      }));
    }
    if (activeFilter === "places") {
      return filteredSpots.map((sp) => ({
        type: "place" as const,
        id: sp.id,
        title: sp.name,
        subtitle: sp.category,
        image: sp.image,
        meta: `${sp.rating.toFixed(1)} ★`,
        metaColor: COLORS.gold,
        onPress: () => setSelectedMarker({ type: "place", data: sp }),
      }));
    }
    // "all" mode — interleave
    const combined = [
      ...filteredEvents.slice(0, 3).map((ev) => ({
        type: "event" as const,
        id: ev.id,
        title: ev.title,
        subtitle: (() => {
          try {
            const d = new Date(ev.date);
            return d.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
          } catch { return ""; }
        })(),
        image: ev.image,
        meta: `${ev.member_count} going`,
        metaColor: COLORS.blue,
        onPress: () => setSelectedMarker({ type: "event", data: ev }),
      })),
      ...filteredSpots.slice(0, 3).map((sp) => ({
        type: "place" as const,
        id: sp.id,
        title: sp.name,
        subtitle: sp.category,
        image: sp.image,
        meta: `${sp.rating.toFixed(1)} ★`,
        metaColor: COLORS.gold,
        onPress: () => setSelectedMarker({ type: "place", data: sp }),
      })),
    ];
    return combined;
  }, [filteredEvents, filteredSpots, activeFilter]);

  return (
    <View style={styles.root}>
      <PlatformMap
        initialLatitude={37.7749}
        initialLongitude={-122.4194}
        markers={allMarkers}
        renderCustomMarker={renderMarker}
        onMapPress={handleMapPress}
      >
        {/* Web preview marker overlays */}
        {Platform.OS === "web" &&
          allMarkers.map((m, i) => (
            <TouchableOpacity
              key={m.id}
              activeOpacity={0.85}
              onPress={m.onPress}
              style={[
                styles.webMarker,
                {
                  top: 200 + i * 68 + (i % 2 === 0 ? 25 : 0),
                  left: 50 + i * 55 + (i % 3 === 1 ? 70 : 0),
                },
              ]}
            >
              {m.type === "event" ? (
                <EventMarkerView active={selectedMarker?.type === "event" && selectedMarker.data.id === m.id} />
              ) : (
                <PlaceMarkerView active={selectedMarker?.type === "place" && selectedMarker.data.id === m.id.replace("spot-", "")} />
              )}
            </TouchableOpacity>
          ))}

        {/* Web current location dot */}
        {Platform.OS === "web" && (
          <View style={styles.currentLocWrap} pointerEvents="none">
            <View style={styles.currentLocPulse} />
            <View style={styles.currentLocDot} />
          </View>
        )}
      </PlatformMap>

      {/* ═══ TOP CONTROLS ═══════════════════════════════════════════════════ */}
      <View style={[styles.topZone, { top: insets.top + 8 }]} pointerEvents="box-none">
        {/* Row 1: Search */}
        <View style={styles.searchShadow}>
          <BlurView intensity={70} tint="light" style={styles.searchBar}>
            <Search size={16} color={COLORS.textSecondary} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Events & Places..."
              placeholderTextColor={COLORS.textTertiary}
              value={query}
              onChangeText={setQuery}
              testID="map-search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
                <X size={14} color={COLORS.textSecondary} strokeWidth={2.4} />
              </TouchableOpacity>
            )}
          </BlurView>
        </View>

        {/* Row 2: City | Radius | Filters */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <TouchableOpacity style={styles.pillShadow} activeOpacity={0.85} testID="city-selector">
              <BlurView intensity={70} tint="light" style={styles.pillBtn}>
                <Text style={styles.pillIconEmoji}>📍</Text>
                <Text style={styles.pillLabel}>{city}</Text>
                <ChevronDown size={13} color={COLORS.textSecondary} strokeWidth={2.4} />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pillShadow} activeOpacity={0.85} testID="radius-selector">
              <BlurView intensity={70} tint="light" style={styles.pillBtn}>
                <Text style={styles.pillLabel}>Within {distance} km</Text>
                <ChevronDown size={13} color={COLORS.textSecondary} strokeWidth={2.4} />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pillShadow} activeOpacity={0.85} testID="filters-btn">
              <BlurView intensity={70} tint="light" style={styles.pillBtn}>
                <SlidersHorizontal size={13} color={COLORS.text} strokeWidth={2.4} />
                <Text style={styles.pillLabel}>Filters</Text>
              </BlurView>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Row 3: Segmented filter control */}
        <View style={styles.segmentRow}>
          <MapSegmentedFilter
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            eventCount={filteredEvents.length}
            placeCount={filteredSpots.length}
          />
        </View>
      </View>

      {/* ═══ FLOATING CONTROLS ═══════════════════════════════════════════════ */}
      <View style={[styles.floatingRightZone, { bottom: 280 }]} pointerEvents="box-none">
        <TouchableOpacity style={styles.roundShadow} activeOpacity={0.85} testID="locate-me" onPress={handleLocateMe}>
          <BlurView intensity={70} tint="light" style={styles.roundBtn}>
            <Crosshair size={18} color={COLORS.text} strokeWidth={2.2} />
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* ═══ SELECTED ITEM CARD ═════════════════════════════════════════════ */}
      <MarkerBottomSheet
        selected={selectedMarker}
        onClose={() => setSelectedMarker(null)}
        onViewEvent={handleViewEvent}
        onJoinEvent={handleJoinEvent}
        onViewPlace={handleViewPlace}
      />

      {/* ═══ BOTTOM DISCOVERY PANEL ═════════════════════════════════════════ */}
      {!selectedMarker && (
        <View style={[styles.bottomWrap, { bottom: 130 }]} pointerEvents="box-none">
          <View style={styles.bottomPanelShadow}>
            <BlurView intensity={60} tint="light" style={styles.bottomPanel}>
              <View style={styles.bottomHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bottomTitle}>
                    {activeFilter === "events"
                      ? "Happening Nearby"
                      : activeFilter === "places"
                      ? "Community Places"
                      : "Discover Nearby"}
                  </Text>
                  <Text style={styles.bottomSub}>
                    {activeFilter === "events"
                      ? "Activities & gatherings near you"
                      : activeFilter === "places"
                      ? "Recommended by the community"
                      : "Events & places near you"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/spots" as any)}
                  activeOpacity={0.85}
                  style={styles.seeAllBtn}
                  testID="open-top-spots"
                >
                  <Text style={styles.seeAll}>See All</Text>
                  <ArrowRight size={13} color={COLORS.blue} strokeWidth={2.4} />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              >
                {bottomItems.map((item) => (
                  <TouchableOpacity
                    key={`${item.type}-${item.id}`}
                    testID={`map-${item.type}-${item.id}`}
                    activeOpacity={0.92}
                    style={styles.carouselCardShadow}
                    onPress={item.onPress}
                  >
                    <View style={styles.carouselCard}>
                      {/* Type indicator badge */}
                      <View style={styles.carouselImgWrap}>
                        <Image source={{ uri: item.image }} style={styles.carouselImg} />
                        <View
                          style={[
                            styles.typeBadge,
                            {
                              backgroundColor:
                                item.type === "event" ? COLORS.blue : "#E07A8B",
                            },
                          ]}
                        >
                          {item.type === "event" ? (
                            <Calendar size={8} color="#FFF" strokeWidth={2.6} />
                          ) : (
                            <MapPin size={8} color="#FFF" strokeWidth={2.6} />
                          )}
                        </View>
                      </View>
                      <View style={styles.carouselMeta}>
                        <Text style={styles.carouselName} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.carouselSub} numberOfLines={1}>
                          {item.subtitle}
                        </Text>
                        <View style={styles.carouselSocial}>
                          {item.type === "event" ? (
                            <Users size={10} color={item.metaColor} strokeWidth={2.2} />
                          ) : (
                            <Star size={10} color={item.metaColor} fill={item.metaColor} />
                          )}
                          <Text
                            style={[
                              styles.carouselSocialText,
                              { color: item.metaColor },
                            ]}
                          >
                            {item.meta}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </BlurView>
          </View>
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARKER STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const markerStyles = StyleSheet.create({
  // Event marker (hexagon)
  eventWrap: { alignItems: "center", justifyContent: "center" },
  eventGlow: {
    position: "absolute",
    backgroundColor: COLORS.blue,
  },
  eventIconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  eventTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: COLORS.blue,
    marginTop: -1,
  },
  // Place marker (circle pin)
  placeWrap: { alignItems: "center", justifyContent: "center" },
  placeGlow: {
    position: "absolute",
    backgroundColor: "#E07A8B",
  },
  placeCircle: {
    backgroundColor: "#E07A8B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    ...SHADOWS.sm,
  },
  placeTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#E07A8B",
    marginTop: -2,
  },
  // Shared cluster
  clusterCount: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800" as const,
    letterSpacing: -0.3,
  },
  clusterBadge: {
    position: "absolute",
    top: -2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// BOTTOM CARD STYLES (Event & Place)
// ═══════════════════════════════════════════════════════════════════════════════
const cardStyles = StyleSheet.create({
  sheetContainer: {
    position: "absolute",
    bottom: 120, // Float above bottom tab bar (similar to old bottom panel)
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 20,
  },
  sheetShadow: {
    ...SHADOWS.lg,
    borderRadius: RADII.xl,
  },
  sheetCard: {
    borderRadius: RADII.xl,
    backgroundColor: "rgba(255, 255, 255, 0.92)", // Sleek white glassmorphic card
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
    padding: SPACING.md, // Spacing around all elements
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    alignSelf: "center",
    marginBottom: SPACING.sm,
  },
  heroContainer: {
    position: "relative",
    width: "100%",
    height: 160,
    borderRadius: RADII.md,
    overflow: "hidden",
    backgroundColor: COLORS.cream,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20, 40, 80, 0.04)",
  },
  placeholderText: {
    ...TYPE.small,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    fontWeight: "500",
  },
  overlayButtons: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: "row",
    gap: SPACING.sm,
  },
  overlayCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  scrollContent: {
    maxHeight: 180, // Limit height of scrollable middle section to keep card compact
    marginTop: SPACING.md,
  },
  scrollContentContainer: {
    paddingBottom: SPACING.xs,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  categoryIconBg: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sheetTitle: {
    ...TYPE.h2,
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: SPACING.xs,
  },
  locationText: {
    ...TYPE.small,
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  distanceText: {
    ...TYPE.caption,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: COLORS.textTertiary,
    fontSize: 12,
  },
  dateText: {
    ...TYPE.caption,
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: "600",
    flex: 1,
  },
  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    ...TYPE.caption,
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "700",
  },
  eventSocialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  avatarStack: {
    flexDirection: "row",
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  eventSocialText: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: "700",
  },
  placeSocialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: SPACING.sm,
  },
  placeSocialText: {
    fontSize: 12,
    color: "#E07A8B",
    fontWeight: "700",
  },
  sheetDescription: {
    ...TYPE.small,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  actionSection: {
    width: "100%",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  joinBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.blue,
    ...SHADOWS.sm,
  },
  joinBtnLabel: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },
  viewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 44,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(109,148,197,0.12)",
    borderWidth: 1,
    borderColor: "rgba(109,148,197,0.25)",
  },
  viewBtnLabel: {
    color: COLORS.blue,
    fontWeight: "700",
    fontSize: 13,
  },
  placeActionBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    borderRadius: RADII.pill,
    backgroundColor: "#E07A8B",
    ...SHADOWS.sm,
  },
  placeActionBtnLabel: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// SEGMENTED FILTER STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const filterStyles = StyleSheet.create({
  outerShadow: { ...SHADOWS.md, borderRadius: RADII.pill, alignSelf: "flex-start" },
  container: {
    flexDirection: "row",
    padding: 4,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  segment: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADII.pill,
  },
  segmentActive: {
    backgroundColor: "#FFFFFF",
    ...SHADOWS.sm,
  },
  segLabel: {
    ...TYPE.caption,
    fontSize: 12,
    fontWeight: "500" as const,
    color: COLORS.textSecondary,
  },
  badge: {
    minWidth: 18,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "700" as const,
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EFE9DC" },

  topZone: {
    position: "absolute",
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 10,
  },
  searchShadow: { ...SHADOWS.md, borderRadius: RADII.pill },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500" as const,
    color: COLORS.text,
    paddingVertical: 0,
    outlineWidth: 0,
  } as any,

  filterRow: { marginTop: 10, flexDirection: "row" },
  pillShadow: { ...SHADOWS.sm, borderRadius: RADII.pill },
  pillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  pillIconEmoji: { fontSize: 11 },
  pillLabel: { ...TYPE.bodyMed, fontSize: 13, fontWeight: "600" as const },

  segmentRow: { marginTop: 10 },

  // Floating controls
  floatingRightZone: {
    position: "absolute",
    right: SPACING.lg,
    zIndex: 10,
    alignItems: "center",
  },
  roundShadow: { ...SHADOWS.md, borderRadius: 22 },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },

  // Markers (web overlay)
  webMarker: { position: "absolute", zIndex: 5 },

  currentLocWrap: {
    position: "absolute",
    top: "48%",
    left: "50%",
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocPulse: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.blue,
    opacity: 0.18,
  },
  currentLocDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.blue,
    borderWidth: 3,
    borderColor: "#FFF",
    ...SHADOWS.md,
  },

  // Bottom discovery panel
  bottomWrap: {
    position: "absolute",
    left: SPACING.lg,
    right: SPACING.lg,
  },
  bottomPanelShadow: { ...SHADOWS.lg, borderRadius: RADII.xl },
  bottomPanel: {
    borderRadius: RADII.xl,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: 12,
    overflow: "hidden",
  },
  bottomHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  bottomTitle: { ...TYPE.h3, fontSize: 16 },
  bottomSub: { ...TYPE.small, fontSize: 11, marginTop: 1 },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  seeAll: { color: COLORS.blue, fontWeight: "700" as const, fontSize: 12 },
  carousel: { paddingHorizontal: 12, gap: 10 },

  // Carousel cards (unified for events & places)
  carouselCardShadow: { ...SHADOWS.sm, borderRadius: RADII.lg, marginRight: 10 },
  carouselCard: {
    width: 248,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: RADII.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: 12,
  },
  carouselImgWrap: { position: "relative" },
  carouselImg: { width: 64, height: 64, borderRadius: 12 },
  typeBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  carouselMeta: { flex: 1 },
  carouselName: { ...TYPE.bodyMed, fontSize: 14 },
  carouselSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  carouselSocial: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },
  carouselSocialText: { fontSize: 11, fontWeight: "700" as const },
});
