// Map tab — Community Map with interactive Bottom Sheet discovery surface
// Architecture:
//   • Map is the primary layer
//   • Top controls animate into bottom sheet composition via Reanimated interpolation
//   • Bottom Sheet has 2 snap points: collapsed 18%, full 96%. Half state removed! (Task 4)
//   • Map opacity de-emphasizes as sheet expands
//   • Floating action stack (Map Content Filter + Locate Me) on the right side of the map (image15/image10 reference)
//   • Map Content Filter button opens a compact Bottom Sheet (38% height) for filtering All/Places/Events
//   • All animations use transform + opacity only (GPU-accelerated) over two-state [0, 1] index range
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import {
  ChevronDown,
  Crosshair,
  MapPin,
  Star,
  Search,
  Users,
  X,
  Calendar,
  Layers,
  SlidersHorizontal,
  ThumbsUp,
} from "lucide-react-native";
import Svg, { Polygon } from "react-native-svg";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import PlatformMap, { MarkerData } from "../../src/components/PlatformMap";
import { api, Spot, Event } from "../../src/api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../src/theme";
import TopSpotsBottomSheet, {
  TopSpotItem,
} from "../../src/components/map/TopSpotsBottomSheet";
import MapFilterSheet from "../../src/components/map/MapFilterSheet";
type MapContentFilter = "all" | "events" | "places";
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT MARKER — Hexagonal shape (dynamic, activity)
// ═══════════════════════════════════════════════════════════════════════════════
const EventMarkerView = React.memo(function EventMarkerView({
  active,
  count,
}: {
  active?: boolean;
  count?: number;
}) {
  const size = count ? 44 : 38;
  const glowSize = size + 18;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  const hex = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");

  return (
    <View
      style={[
        markerStyles.eventWrap,
        { width: glowSize, height: glowSize + 8 },
      ]}
      accessibilityLabel={
        count ? `${count} events in this area` : "Event marker"
      }
      accessibilityRole="button"
    >
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
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Polygon
            points={hex}
            fill={COLORS.blue}
            stroke="#FFFFFF"
            strokeWidth={2.5}
          />
        </Svg>
        <View
          style={[markerStyles.eventIconOverlay, { width: size, height: size }]}
        >
          {count ? (
            <Text style={markerStyles.clusterCount}>{count}</Text>
          ) : (
            <Calendar size={14} color="#FFF" strokeWidth={2.4} />
          )}
        </View>
      </View>
      <View style={markerStyles.eventTail} />
      {count ? (
        <View style={markerStyles.clusterBadge}>
          <Calendar size={8} color="#FFF" strokeWidth={2.6} />
        </View>
      ) : null}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// PLACE MARKER — Circular pin shape (stable, location)
// ═══════════════════════════════════════════════════════════════════════════════
const PlaceMarkerView = React.memo(function PlaceMarkerView({
  active,
  count,
}: {
  active?: boolean;
  count?: number;
}) {
  const circleSize = count ? 40 : 34;
  const glowSize = circleSize + 16;

  return (
    <View
      style={[
        markerStyles.placeWrap,
        { width: glowSize, height: glowSize + 10 },
      ]}
      accessibilityLabel={
        count ? `${count} places in this area` : "Place marker"
      }
      accessibilityRole="button"
    >
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
      <View style={markerStyles.placeTail} />
      {count ? (
        <View
          style={[markerStyles.clusterBadge, { backgroundColor: "#E07A8B" }]}
        >
          <MapPin size={8} color="#FFF" strokeWidth={2.6} />
        </View>
      ) : null}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// INLINE PLACE CARD (for Bottom Sheet)
// ═══════════════════════════════════════════════════════════════════════════════
const PlaceListCard = React.memo(function PlaceListCard({
  place,
  isSelected,
}: {
  place: Spot;
  isSelected: boolean;
}) {
  return (
    <View
      style={[
        cardStyles.card,
        isSelected ? cardStyles.cardSelected : undefined,
      ]}
      testID={`topspot-place-${place.id}`}
    >
      {/* Hero Image */}
      <View style={cardStyles.imageWrap}>
        <Image source={{ uri: place.image }} style={cardStyles.image} />
        {/* Category badge */}
        <View
          style={[
            cardStyles.categoryBadge,
            { backgroundColor: "rgba(224,122,139,0.88)" },
          ]}
        >
          <MapPin size={8} color="#FFF" strokeWidth={2.4} />
          <Text style={cardStyles.categoryBadgeText}>
            {place.category || "Place"}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={cardStyles.content}>
        <Text style={cardStyles.name} numberOfLines={1}>
          {place.name}
        </Text>

        {/* Rating row */}
        <View style={cardStyles.metaRow}>
          <Star size={11} color={COLORS.gold} fill={COLORS.gold} />
          <Text style={cardStyles.ratingText}>{place.rating.toFixed(1)}</Text>
          <Text style={cardStyles.dotSep}>·</Text>
          <Text style={cardStyles.metaText} numberOfLines={1}>
            {place.category}
          </Text>
        </View>

        {/* Location */}
        <View style={cardStyles.metaRow}>
          <MapPin size={10} color={COLORS.textTertiary} strokeWidth={2} />
          <Text style={cardStyles.locationText} numberOfLines={1}>
            {place.address}
          </Text>
        </View>

        {/* Tags + Distance */}
        <View style={bottomRowStyles.bottomRow}>
          {place.distance_km != null ? (
            <Text style={cardStyles.distanceText}>
              {place.distance_km.toFixed(1)} km
            </Text>
          ) : null}
          {place.recommendation_count != null ? (
            <View style={cardStyles.attendanceBadge}>
              <ThumbsUp size={9} color="#E07A8B" strokeWidth={2.2} />
              <Text style={[cardStyles.attendanceText, { color: "#E07A8B" }]}>
                {place.recommendation_count}
              </Text>
            </View>
          ) : null}
          {/* Tag pill */}
          <View
            style={[
              cardStyles.tagPill,
              { backgroundColor: "rgba(224,122,139,0.08)" },
            ]}
          >
            <Text style={[cardStyles.tagText, { color: "#E07A8B" }]}>
              {place.category}
            </Text>
          </View>
        </View>
      </View>

      {/* Selected indicator */}
      {isSelected ? (
        <View
          style={[cardStyles.selectedBar, { backgroundColor: "#E07A8B" }]}
        />
      ) : null}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// INLINE EVENT CARD (for Bottom Sheet)
// ═══════════════════════════════════════════════════════════════════════════════
function formatEventDate(iso: string): string {
  try {
    const d = new Date(iso);
    const day = d.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const time = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${day} · ${time}`;
  } catch {
    return iso;
  }
}

const EventListCard = React.memo(function EventListCard({
  event,
  isSelected,
}: {
  event: Event;
  isSelected: boolean;
}) {
  return (
    <View
      style={[
        cardStyles.card,
        isSelected ? cardStyles.cardSelected : undefined,
      ]}
      testID={`topspot-event-${event.id}`}
    >
      {/* Hero Image */}
      <View style={cardStyles.imageWrap}>
        <Image source={{ uri: event.image }} style={cardStyles.image} />
        {/* Date badge */}
        <View style={cardStyles.dateBadge}>
          <Text style={cardStyles.dateBadgeDay}>
            {(() => {
              try {
                return new Date(event.date).getDate().toString();
              } catch {
                return "?";
              }
            })()}
          </Text>
          <Text style={cardStyles.dateBadgeMonth}>
            {(() => {
              try {
                return new Date(event.date).toLocaleDateString("en", {
                  month: "short",
                });
              } catch {
                return "";
              }
            })()}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={cardStyles.content}>
        <Text style={cardStyles.name} numberOfLines={1}>
          {event.title}
        </Text>

        {/* Date & Time row */}
        <View style={cardStyles.metaRow}>
          <Calendar size={10} color={COLORS.blue} strokeWidth={2.2} />
          <Text
            style={[cardStyles.metaText, { color: COLORS.blue }]}
            numberOfLines={1}
          >
            {formatEventDate(event.date)}
          </Text>
        </View>

        {/* Location */}
        <View style={cardStyles.metaRow}>
          <MapPin size={10} color={COLORS.textTertiary} strokeWidth={2} />
          <Text style={cardStyles.locationText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        {/* Attendance + Tags */}
        <View style={bottomRowStyles.bottomRow}>
          <View
            style={[
              cardStyles.attendanceBadge,
              { backgroundColor: "rgba(109,148,197,0.1)" },
            ]}
          >
            <Users size={9} color={COLORS.blue} strokeWidth={2.2} />
            <Text style={[cardStyles.attendanceText, { color: COLORS.blue }]}>
              {event.member_count} Going
            </Text>
          </View>
          {/* Tag pill */}
          <View
            style={[
              cardStyles.tagPill,
              { backgroundColor: "rgba(109,148,197,0.08)" },
            ]}
          >
            <Text style={[cardStyles.tagText, { color: COLORS.blue }]}>
              {event.category || event.event_type || "Event"}
            </Text>
          </View>
        </View>
      </View>

      {/* Selected indicator */}
      {isSelected ? (
        <View
          style={[cardStyles.selectedBar, { backgroundColor: COLORS.blue }]}
        />
      ) : null}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN MAP SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Bottom Sheet References
  const topSpotsRef = useRef<BottomSheet>(null);

  // Filter Menu sheet visibility state
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // ── Reanimated shared values for sheet → map/controls synchronization ──
  // Now ranges from 0 (collapsed) to 1 (fully expanded). Half state removed!
  const sheetAnimatedIndex = useSharedValue(0);
  const sheetAnimatedPosition = useSharedValue(SCREEN_H);

  // ── Separate Independent States (Technical Requirements) ──
  const [mapContentFilter, setMapContentFilter] =
    useState<MapContentFilter>("all");
  const [isTopSpotsExpanded, setIsTopSpotsExpanded] = useState(false);

  // ── Additional Filter States ──
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [onlyHighlyRated, setOnlyHighlyRated] = useState(false);
  const [onlyJoinedEvents, setOnlyJoinedEvents] = useState(false);

  // ── Derived animated values (GPU-only, no JS thread, based on two snap points [0, 1]) ──

  // Map layer opacity: 1.0 at collapsed (index 0) → 0.35 at fully expanded (index 1)
  const mapOpacity = useDerivedValue(() =>
    interpolate(
      sheetAnimatedIndex.value,
      [0, 1],
      [1, 0.35],
      Extrapolation.CLAMP,
    ),
  );

  // Top controls: translateY shifts controls upward as sheet expands
  // to save layout space and look compact (subtle 8px shift)
  const controlsTranslateY = useDerivedValue(() =>
    interpolate(sheetAnimatedIndex.value, [0, 1], [0, -8], Extrapolation.CLAMP),
  );

  // Unified topZone header background opacity
  const topZoneBgStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      sheetAnimatedIndex.value,
      [0.2, 0.8],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  // Individual controls backgrounds (fade out as unified header fades in)
  const individualBgStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      sheetAnimatedIndex.value,
      [0.2, 0.8],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  // ── Animated styles ──
  const mapAnimatedStyle = useAnimatedStyle(() => ({
    opacity: mapOpacity.value,
  }));

  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: controlsTranslateY.value }],
  }));

  // ── Data state ──
  const [spots, setSpots] = useState<Spot[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Gdańsk");
  const [distance, setDistance] = useState("10");

  // Map region control state
  const [mapRegion, setMapRegion] = useState({
    latitude: 54.352, // default Gdańsk
    longitude: 18.6466,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [hasCentered, setHasCentered] = useState(false);

  // Load data
  useEffect(() => {
    (async () => {
      const [s, e] = await Promise.all([api.spots(), api.events()]);
      setSpots(s);
      setEvents(e);
    })();
  }, []);

  // Initially center map on loaded data
  useEffect(() => {
    if (!hasCentered && (spots.length > 0 || events.length > 0)) {
      const first = spots[0] || events[0];
      if (first) {
        setMapRegion({
          latitude: first.latitude,
          longitude: first.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        });
        setHasCentered(true);
      }
    }
  }, [spots, events, hasCentered]);

  // Filtered data based on active mapContentFilter, category, and joined toggle
  const filteredEvents = useMemo(() => {
    if (mapContentFilter === "places") return [];
    let res = events;
    if (onlyJoinedEvents) {
      res = res.filter((e) => e.going);
    }
    if (selectedCategory && selectedCategory !== "all") {
      res = res.filter((e) => {
        const cat = (e.category || e.event_type || "").toLowerCase();
        return cat === selectedCategory.toLowerCase();
      });
    }
    if (query.trim()) {
      res = res.filter((e) =>
        e.title.toLowerCase().includes(query.toLowerCase()),
      );
    }
    return res;
  }, [events, mapContentFilter, selectedCategory, onlyJoinedEvents, query]);

  // Filtered data based on active mapContentFilter and highly rated toggle
  const filteredSpots = useMemo(() => {
    if (mapContentFilter === "events") return [];
    let res = spots;
    if (onlyHighlyRated) {
      res = res.filter((s) => s.rating >= 4.5);
    }
    if (query.trim()) {
      res = res.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()),
      );
    }
    return res;
  }, [spots, mapContentFilter, onlyHighlyRated, query]);

  // Combine markers for the map
  const allMarkers = useMemo<MarkerData[]>(() => {
    const eventMarkers: MarkerData[] = filteredEvents.map((ev) => ({
      id: ev.id,
      latitude: ev.latitude,
      longitude: ev.longitude,
      title: ev.title,
      type: "event" as const,
      onPress: () => {
        setSelectedItemId(ev.id);
        // Center on marker on press
        setMapRegion({
          latitude: ev.latitude,
          longitude: ev.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        });
      },
    }));
    const spotMarkers: MarkerData[] = filteredSpots.map((sp) => ({
      id: `spot-${sp.id}`,
      latitude: sp.latitude,
      longitude: sp.longitude,
      title: sp.name,
      type: "place" as const,
      onPress: () => {
        setSelectedItemId(`spot-${sp.id}`);
        // Center on marker on press
        setMapRegion({
          latitude: sp.latitude,
          longitude: sp.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        });
      },
    }));
    return [...eventMarkers, ...spotMarkers];
  }, [filteredEvents, filteredSpots]);

  // Map press — deselect
  const handleMapPress = useCallback(() => {
    if (selectedItemId) {
      setSelectedItemId(null);
    }
  }, [selectedItemId]);

  // Centering on user geolocation
  const handleLocateMe = useCallback(() => {
    const successCallback = (position: any) => {
      setMapRegion({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    };

    const errorCallback = (error: any) => {
      console.warn("Location error:", error);
      // Fallback to average coordinate or default city
      if (spots.length > 0) {
        setMapRegion({
          latitude: spots[0].latitude,
          longitude: spots[0].longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      } else if (events.length > 0) {
        setMapRegion({
          latitude: events[0].latitude,
          longitude: events[0].longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    };

    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000,
      });
    } else {
      errorCallback(new Error("Geolocation not supported"));
    }
  }, [spots, events]);

  // Render custom marker based on type
  const renderMarker = useCallback(
    (m: MarkerData) => {
      if (m.type === "event") {
        const isActive = selectedItemId === m.id;
        return <EventMarkerView active={isActive} />;
      }
      const isActive = selectedItemId === m.id;
      return <PlaceMarkerView active={isActive} />;
    },
    [selectedItemId],
  );

  // Bottom Sheet: selecting an item
  const handleSelectItem = useCallback(
    (item: TopSpotItem) => {
      const itemId =
        item.type === "event" ? item.data.id : `spot-${item.data.id}`;
      setSelectedItemId(itemId);

      // Center on selected item coordinate
      setMapRegion({
        latitude: item.data.latitude,
        longitude: item.data.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });

      // Navigate to detail on tap if already selected
      if (selectedItemId === itemId) {
        if (item.type === "event") {
          router.push(`/event/${item.data.id}` as any);
        } else {
          router.push("/spots" as any);
        }
      }
    },
    [selectedItemId, router],
  );

  // Bottom Sheet: render card
  const renderBottomSheetCard = useCallback(
    (item: TopSpotItem, isSelected: boolean) => {
      if (item.type === "event") {
        return (
          <EventListCard event={item.data as Event} isSelected={isSelected} />
        );
      }
      return (
        <PlaceListCard place={item.data as Spot} isSelected={isSelected} />
      );
    },
    [],
  );

  // Sync state for Top Spots Bottom Sheet
  const handleSheetChange = useCallback((index: number) => {
    setIsTopSpotsExpanded(index === 1);
  }, []);

  // Right-Side Floating Action Stack: Map controls are FIXED to avoid layout shift when sheet expands.
  const floatingStackStyle = {
    bottom: SCREEN_H * 0.23, // Positions controls above the 20% Top Spots collapsed sheet
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* ═══ ARCHITECTURAL LAYER 1: MAP LAYER ═══════════════════════════════ */}
      <View style={StyleSheet.absoluteFill}>
        {/* ═══ MAP (with animated opacity) ═══════════════════════════════ */}
        <Animated.View style={[styles.mapLayer, mapAnimatedStyle]}>
          <PlatformMap
            initialLatitude={54.352}
            initialLongitude={18.6466}
            region={mapRegion}
            markers={allMarkers}
            renderCustomMarker={renderMarker}
            onMapPress={handleMapPress}
          >
            {/* Web preview marker overlays */}
            {Platform.OS === "web"
              ? allMarkers.map((m, i) => (
                  <Pressable
                    key={m.id}
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
                      <EventMarkerView active={selectedItemId === m.id} />
                    ) : (
                      <PlaceMarkerView active={selectedItemId === m.id} />
                    )}
                  </Pressable>
                ))
              : null}

            {/* Web current location dot */}
            {Platform.OS === "web" ? (
              <View style={styles.currentLocWrap} pointerEvents="none">
                <View style={styles.currentLocPulse} />
                <View style={styles.currentLocDot} />
              </View>
            ) : null}
          </PlatformMap>
        </Animated.View>

        {/* ═══ FLOATING ACTION STACK (Right-side, image15/image10 reference) ═════ */}
        <View
          style={[styles.floatingStack, floatingStackStyle]}
          pointerEvents="box-none"
        >
          {/* Locate Me Button */}
          <Pressable
            style={styles.floatingBtn}
            onPress={handleLocateMe}
            accessibilityLabel="Center map on current location"
          >
            <Crosshair size={22} color={COLORS.blue} strokeWidth={2.4} />
          </Pressable>
        </View>

        {/* ═══ TOP CONTROLS (animated with sheet position) ═════════════════════ */}
        <Animated.View
          style={[styles.topZone, controlsAnimatedStyle]}
          pointerEvents="box-none"
        >
          {/* Unified Header Background */}
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              topZoneBgStyle,
              styles.topZoneBg,
            ]}
          />

          {/* Content Container (Height = insets.top + 108px, Task 2 exact spacing math) */}
          <View
            style={[
              styles.topZoneContent,
              { paddingTop: insets.top + SPACING.sm },
            ]}
          >
            {/* Row 1: Search (height = 48px) */}
            <View style={styles.searchShadow}>
              <View style={styles.searchBar}>
                <Animated.View
                  style={[
                    StyleSheet.absoluteFillObject,
                    individualBgStyle,
                    styles.searchBarBg,
                  ]}
                />
                <View style={styles.searchBarContent}>
                  <Search size={16} color="#4E493F" strokeWidth={2.4} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search Events & Places..."
                    placeholderTextColor="#8A8576"
                    value={query}
                    onChangeText={setQuery}
                    testID="map-search"
                  />
                  {query.length > 0 ? (
                    <Pressable onPress={() => setQuery("")} hitSlop={8}>
                      <X size={14} color="#8A8576" strokeWidth={2.4} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Row 2: Scrollable filter pills (Gdańsk | Within 10 km | Filters) (height = 40px) */}
            <View style={styles.filterRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContent}
                style={styles.filterScroll}
              >
                <Pressable style={styles.pillShadow} testID="city-selector">
                  <View style={styles.pillBtn}>
                    <Animated.View
                      style={[
                        StyleSheet.absoluteFillObject,
                        individualBgStyle,
                        styles.pillBtnBg,
                      ]}
                    />
                    <View style={styles.pillBtnContent}>
                      <Text style={styles.pillIconEmoji}>📍</Text>
                      <Text style={styles.pillLabel}>{city}</Text>
                      <ChevronDown size={13} color="#8A8576" strokeWidth={2} />
                    </View>
                  </View>
                </Pressable>

                <Pressable
                  style={styles.pillShadow}
                  testID="filters-btn"
                  onPress={() => setIsFilterMenuOpen(true)}
                >
                  <View style={styles.pillBtn}>
                    <Animated.View
                      style={[
                        StyleSheet.absoluteFillObject,
                        individualBgStyle,
                        styles.pillBtnBg,
                      ]}
                    />
                    <View style={styles.pillBtnContent}>
                      <SlidersHorizontal
                        size={13}
                        color="#4E6C3B"
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.pillLabel,
                          { color: "#4E6C3B", fontWeight: "700" },
                        ]}
                      >
                        Filters
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* ═══ ARCHITECTURAL LAYER 2: CONTENT LAYER ═══════════════════════════════ */}
      <View
        style={[StyleSheet.absoluteFill, { zIndex: 10 }]}
        pointerEvents="box-none"
      >
        {/* ═══ TOP SPOTS BOTTOM SHEET (Task 4 ref forwarded) ═══════════════════ */}
        <TopSpotsBottomSheet
          ref={topSpotsRef}
          events={filteredEvents}
          places={filteredSpots}
          selectedItemId={selectedItemId}
          onSelectItem={handleSelectItem}
          onSheetChange={handleSheetChange}
          renderCard={renderBottomSheetCard}
          animatedIndex={sheetAnimatedIndex}
          animatedPosition={sheetAnimatedPosition}
          topInset={insets.top}
          bottomInset={insets.bottom}
        />

        {/* ═══ MAP FILTERS COMPREHENSIVE SHEET ═════════════════════════════════ */}
        <MapFilterSheet
          visible={isFilterMenuOpen}
          onClose={() => setIsFilterMenuOpen(false)}
          mapContentFilter={mapContentFilter}
          onMapContentFilterChange={setMapContentFilter}
          distance={distance}
          onDistanceChange={setDistance}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onlyHighlyRated={onlyHighlyRated}
          onOnlyHighlyRatedChange={setOnlyHighlyRated}
          onlyJoinedEvents={onlyJoinedEvents}
          onOnlyJoinedEventsChange={setOnlyJoinedEvents}
        />
      </View>
    </GestureHandlerRootView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD STYLES (used by inline PlaceListCard and EventListCard)
// ═══════════════════════════════════════════════════════════════════════════════
const cardStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADII.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    gap: SPACING.lg,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  cardSelected: {
    backgroundColor: "rgba(78, 108, 59, 0.04)",
    borderColor: "rgba(78, 108, 59, 0.15)",
    ...SHADOWS.md,
  },
  imageWrap: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: RADII.md,
    overflow: "hidden",
    backgroundColor: COLORS.cream,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: RADII.md,
  },
  categoryBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADII.pill,
  },
  categoryBadgeText: {
    fontSize: 8,
    fontWeight: "700" as const,
    color: "#FFF",
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
  },
  dateBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 28,
    height: 30,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  dateBadgeDay: {
    fontSize: 13,
    fontWeight: "800" as const,
    color: COLORS.text,
    lineHeight: 15,
  },
  dateBadgeMonth: {
    fontSize: 8,
    fontWeight: "600" as const,
    color: COLORS.textSecondary,
    textTransform: "uppercase" as const,
    lineHeight: 10,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  name: {
    ...TYPE.h3,
    fontSize: 15,
    fontWeight: "700" as const,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: COLORS.text,
    letterSpacing: -0.1,
  },
  dotSep: {
    fontSize: 10,
    color: COLORS.textTertiary,
    marginHorizontal: 2,
  },
  metaText: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: COLORS.textSecondary,
    flex: 1,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.textTertiary,
    flex: 1,
    letterSpacing: -0.1,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: COLORS.textSecondary,
    letterSpacing: -0.1,
  },
  attendanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(224,122,139,0.08)",
  },
  attendanceText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  tagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADII.pill,
  },
  tagText: {
    fontSize: 9,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
  },
  selectedBar: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderRadius: 2,
  },
});

const bottomRowStyles = StyleSheet.create({
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
});

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
// FILTER SHEET STYLES (image15 reference)
// ═══════════════════════════════════════════════════════════════════════════════
const filterSheetStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  headerTitle: {
    ...TYPE.h3,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.glassBorderSoft,
    marginBottom: SPACING.lg,
  },
  optionsList: {
    gap: SPACING.sm,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    borderRadius: RADII.md,
    backgroundColor: "rgba(20,40,80,0.02)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionRowSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: COLORS.glassBorderSoft,
    ...SHADOWS.sm,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  optionLabel: {
    ...TYPE.bodyMed,
    fontSize: 15,
    color: COLORS.text,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EFE9DC" },

  // Map layer — covers full screen, animated opacity as sheet expands
  mapLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },

  topZone: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 20,
  },
  topZoneBg: {
    backgroundColor: "#FAF9F5",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  topZoneContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 4, // exactly 4px vertical padding bottom! (Task 2)
  },
  searchShadow: { ...SHADOWS.sm, borderRadius: RADII.pill },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADII.pill,
    overflow: "hidden",
    height: 48,
  },
  searchBarBg: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: RADII.pill,
  },
  searchBarContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: SPACING.lg,
    height: 48,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#4E493F",
    paddingVertical: 0,
    outlineWidth: 0,
  } as any,

  filterRow: {
    marginTop: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  filterScroll: { flex: 1 },
  filterScrollContent: { gap: SPACING.xs },
  pillShadow: { ...SHADOWS.sm, borderRadius: RADII.pill, height: 40 },
  pillBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADII.pill,
    overflow: "hidden",
    height: 40,
  },
  pillBtnBg: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: RADII.pill,
  },
  pillBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    height: 40,
  },
  pillIconEmoji: { fontSize: 11 },
  pillLabel: {
    ...TYPE.bodyMed,
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#4E493F",
  },

  // Floating button stack (image15/image10 reference)
  floatingStack: {
    position: "absolute",
    right: SPACING.lg,
    zIndex: 2,
    gap: SPACING.sm,
  },
  floatingBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.glassBorderSoft,
    ...SHADOWS.md,
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
});
