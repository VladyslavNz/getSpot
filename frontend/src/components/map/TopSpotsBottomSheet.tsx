// TopSpotsBottomSheet — Premium interactive discovery surface
// Rebuilt from the ground up to support exactly two states (collapsed: 18%, expanded: 100%)
// Ref-forwarded to allow independent programmatical controls from parent map screen
import React, { useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Dimensions,
  ListRenderItem,
} from "react-native";
import BottomSheet, {
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import {
  MapPin,
  TrendingUp,
  ChevronUp,
} from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  useSharedValue,
  useDerivedValue,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../theme";
import type { Event, Spot } from "../../api";

const { height: SCREEN_H } = Dimensions.get("window");

// ─── Unified item type ────────────────────────────────────────────────────────
export type TopSpotItem =
  | { type: "event"; data: Event }
  | { type: "place"; data: Spot };

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  events: Event[];
  places: Spot[];
  selectedItemId: string | null;
  onSelectItem: (item: TopSpotItem) => void;
  onSheetChange?: (index: number) => void;
  renderCard: (item: TopSpotItem, isSelected: boolean) => React.ReactElement;
  /** Exposed to parent for synchronized map/controls animations */
  animatedIndex?: SharedValue<number>;
  /** Exposed to parent for pixel-accurate position tracking */
  animatedPosition?: SharedValue<number>;
  /** Safe area top inset for fully-expanded header spacing */
  topInset?: number;
  /** Safe area bottom inset for list padding spacing */
  bottomInset?: number;
};

// ─── Custom Handle — Drag indicator only (compact 16px height) ─────────────────
const SheetHandle = React.memo(function SheetHandle() {
  return (
    <View style={handleStyles.container}>
      <View style={handleStyles.indicator} />
    </View>
  );
});

// ─── Main Component (React.forwardRef) ──────────────────────────────────────────
const TopSpotsBottomSheet = React.forwardRef<BottomSheet, Props>(
  function TopSpotsBottomSheet(
    {
      events,
      places,
      selectedItemId,
      onSelectItem,
      onSheetChange,
      renderCard,
      animatedIndex: externalAnimatedIndex,
      animatedPosition: externalAnimatedPosition,
      topInset = 0,
      bottomInset = 0,
    },
    ref
  ) {
    const internalRef = useRef<BottomSheet>(null);
    const bottomSheetRef = (ref as React.RefObject<BottomSheet>) || internalRef;
    const flatListRef = useRef<FlatList<TopSpotItem>>(null);

    // Use external shared values if provided, otherwise create internal ones
    const internalAnimatedIndex = useSharedValue(0);
    const internalAnimatedPosition = useSharedValue(SCREEN_H);
    const animatedIndex = externalAnimatedIndex ?? internalAnimatedIndex;
    const animatedPosition = externalAnimatedPosition ?? internalAnimatedPosition;

    // Snap points: collapsed (~20%), fully expanded (~100%). Middle states removed!
    const snapPoints = useMemo(() => {
      return ["10%", "100%"];
    }, []);

    // Merge events and places into a single interleaved list
    const items = useMemo<TopSpotItem[]>(() => {
      const result: TopSpotItem[] = [];
      const maxLen = Math.max(events.length, places.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < places.length) {
          result.push({ type: "place", data: places[i] });
        }
        if (i < events.length) {
          result.push({ type: "event", data: events[i] });
        }
      }
      return result;
    }, [events, places]);

    // When selectedItemId changes externally (marker tap), scroll to that item
    useEffect(() => {
      if (selectedItemId && flatListRef.current) {
        const idx = items.findIndex((item) => {
          const id =
            item.type === "event" ? item.data.id : `spot-${item.data.id}`;
          return id === selectedItemId;
        });
        if (idx >= 0) {
          flatListRef.current.scrollToIndex({
            index: idx,
            animated: true,
            viewPosition: 0.3,
          });
          // Expand sheet directly to expanded state (index 1) if collapsed
          if (animatedIndex.value < 0.5) {
            bottomSheetRef.current?.snapToIndex(1);
            onSheetChange?.(1);
          }
        }
      }
    }, [selectedItemId, items, animatedIndex, onSheetChange, bottomSheetRef]);

    const handleSheetChange = useCallback(
      (index: number) => {
        onSheetChange?.(index);
      },
      [onSheetChange]
    );

    const getItemId = useCallback((item: TopSpotItem) => {
      return item.type === "event"
        ? item.data.id
        : `spot-${item.data.id}`;
    }, []);

    const keyExtractor = useCallback(
      (item: TopSpotItem) => `${item.type}-${getItemId(item)}`,
      [getItemId]
    );

    const renderItem: ListRenderItem<TopSpotItem> = useCallback(
      ({ item }) => {
        const itemId = getItemId(item);
        const isSelected = itemId === selectedItemId;
        return (
          <Pressable
            onPress={() => onSelectItem(item)}
            style={listStyles.itemWrap}
          >
            {renderCard(item, isSelected)}
          </Pressable>
        );
      },
      [selectedItemId, onSelectItem, renderCard, getItemId]
    );

    const ItemSeparator = useCallback(
      () => <View style={listStyles.separator} />,
      []
    );

    const ListEmpty = useCallback(
      () => (
        <View style={listStyles.emptyWrap}>
          <MapPin size={32} color={COLORS.textSecondary} strokeWidth={1.5} />
          <Text style={listStyles.emptyText}>No spots nearby</Text>
          <Text style={listStyles.emptySubtext}>
            Try expanding your search area
          </Text>
        </View>
      ),
      []
    );

    const onScrollToIndexFailed = useCallback(
      (info: { index: number; highestMeasuredFrameIndex: number }) => {
        const wait = new Promise((resolve) => setTimeout(resolve, 200));
        wait.then(() => {
          flatListRef.current?.scrollToIndex({
            index: info.index,
            animated: true,
          });
        });
      },
      []
    );

    // ─── Animations for Top Reserved Area System ──────────────────────────────────
    // Height of top controls content is exactly 104px.
    // target_top_of_header = topInset + 108px (bottom of top controls content + 4px gap).
    // top_of_sheet_content = 16px (handle height).
    // maxSpacerHeight = (topInset + 108) - 16 = topInset + 92 px.
    const maxSpacerHeight = topInset + 92;

    // Reserved spacer height interpolates from 0 at index 0 to maxSpacerHeight at index 1
    const animatedReservedHeight = useDerivedValue(() => {
      return interpolate(
        animatedIndex.value,
        [0.0, 1.0],
        [0, maxSpacerHeight],
        Extrapolation.CLAMP
      );
    });

    const animatedReservedStyle = useAnimatedStyle(() => ({
      height: animatedReservedHeight.value,
    }));

    const chevronStyle = useAnimatedStyle(() => ({
      transform: [
        {
          rotate: `${interpolate(
            animatedIndex.value,
            [0, 1],
            [0, 180]
          )}deg`,
        },
      ],
      opacity: interpolate(animatedIndex.value, [0, 0.5, 1], [1, 0.5, 0.3]),
    }));

    // ─── Collapsed summary header styling (fades out as sheet expands) ──────────────
    const collapsedHeaderStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        animatedIndex.value,
        [0.0, 0.8],
        [1, 0],
        Extrapolation.CLAMP
      );
      const translateY = interpolate(
        animatedIndex.value,
        [0.0, 0.8],
        [0, -10],
        Extrapolation.CLAMP
      );
      const display = animatedIndex.value > 0.9 ? "none" : "flex";
      return {
        opacity,
        transform: [{ translateY }],
        display,
      };
    });

    // ─── Expanded header styling (fades in past index 0.2) ──────────────────────────
    const expandedHeaderStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        animatedIndex.value,
        [0.2, 1.0],
        [0, 1],
        Extrapolation.CLAMP
      );
      const translateY = interpolate(
        animatedIndex.value,
        [0.2, 1.0],
        [10, 0],
        Extrapolation.CLAMP
      );
      const display = animatedIndex.value < 0.1 ? "none" : "flex";
      return {
        opacity,
        transform: [{ translateY }],
        display,
      };
    });

    // ─── FlatList progressive reveal animation (completely hidden when collapsed) ────
    const listAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        animatedIndex.value,
        [0.1, 1.0],
        [0, 1],
        Extrapolation.CLAMP
      );
      const translateY = interpolate(
        animatedIndex.value,
        [0.1, 1.0],
        [16, 0],
        Extrapolation.CLAMP
      );
      const display = animatedIndex.value < 0.05 ? "none" : "flex";
      return {
        opacity,
        transform: [{ translateY }],
        display,
      };
    });

    // Tapping header wrapper snaps sheet collapsed/expanded directly
    const handleHeaderPress = useCallback(() => {
      if (animatedIndex.value < 0.5) {
        bottomSheetRef.current?.snapToIndex(1);
        onSheetChange?.(1);
      } else {
        bottomSheetRef.current?.snapToIndex(0);
        onSheetChange?.(0);
      }
    }, [onSheetChange, animatedIndex, bottomSheetRef]);

    // Since the sheet bottom aligns with the top of the tab bar via bottomInset,
    // we only need a standard padding at the bottom of the list.
    const listPaddingBottom = SPACING.lg;
    const summaryText = `${places.length} Places • ${events.length} Events Nearby`;

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        animatedIndex={animatedIndex}
        animatedPosition={animatedPosition}
        enablePanDownToClose={false}
        enableDynamicSizing={false}
        enableContentPanningGesture={true}
        enableHandlePanningGesture={true}
        handleComponent={SheetHandle}
        backgroundStyle={sheetStyles.background}
        style={sheetStyles.sheet}
        handleIndicatorStyle={sheetStyles.handleIndicator}
        animateOnMount
        topInset={0} // Covers full screen when expanded
        bottomInset={56 + bottomInset} // Offset from the bottom Navigation Bar
      >
        {/* ─── Top Spots Header & Spacer ─── */}
        <Pressable onPress={handleHeaderPress} style={headerStyles.wrapper}>
          <Animated.View style={animatedReservedStyle} />
          <View style={headerStyles.headerContentContainer}>
            {/* Centered Collapsed Summary Block */}
            <Animated.View style={[collapsedHeaderStyle, headerStyles.collapsedContainer]}>
              <Text style={headerStyles.collapsedTitle}>Top Spots</Text>
              <Text style={headerStyles.collapsedSubtitle}>{summaryText}</Text>
            </Animated.View>

            {/* Left-aligned Expanded Header Row */}
            <Animated.View style={[expandedHeaderStyle, headerStyles.headerRow]}>
              <View style={headerStyles.headerLeft}>
                <View style={headerStyles.titleRow}>
                  <TrendingUp size={16} color="#4E6C3B" strokeWidth={2.4} />
                  <Text style={headerStyles.title}>Top Spots</Text>
                </View>
                <Text style={headerStyles.subtitle}>{summaryText}</Text>
              </View>
              <Animated.View style={chevronStyle}>
                <ChevronUp size={18} color="#8A8576" strokeWidth={2} />
              </Animated.View>
            </Animated.View>
          </View>
        </Pressable>

        {/* Scrollable list revealing dynamically on expand */}
        <Animated.View style={[{ flex: 1 }, listAnimatedStyle]}>
          <BottomSheetFlatList
            ref={flatListRef as any}
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={ItemSeparator}
            ListEmptyComponent={ListEmpty}
            contentContainerStyle={[listStyles.contentContainer, { paddingBottom: listPaddingBottom }]}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews={Platform.OS !== "web"}
            onScrollToIndexFailed={onScrollToIndexFailed}
            getItemLayout={(_data, index) => ({
              length: 108,
              offset: 108 * index + 8 * index,
              index,
            })}
          />
        </Animated.View>
      </BottomSheet>
    );
  }
);

export default TopSpotsBottomSheet;

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const sheetStyles = StyleSheet.create({
  sheet: {
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  background: {
    backgroundColor: "#F4F3ED",
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    borderWidth: 0,
  },
  handleIndicator: {
    display: "none",
  },
});

const handleStyles = StyleSheet.create({
  container: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
  },
  indicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    alignSelf: "center",
  },
});

const headerStyles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    paddingBottom: 12,
  },
  headerContentContainer: {
    position: "relative",
    height: 48,
    marginBottom: 0,
  },
  headerRow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    ...TYPE.h3,
    fontSize: 17,
    fontWeight: "700",
    color: "#4E493F",
  },
  subtitle: {
    ...TYPE.small,
    fontSize: 12,
    color: "#8A8576",
    marginTop: 2,
    letterSpacing: -0.1,
  },
  collapsedContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  collapsedTitle: {
    ...TYPE.h3,
    fontSize: 16,
    fontWeight: "600",
    color: "#4E493F",
    letterSpacing: -0.3,
  },
  collapsedSubtitle: {
    ...TYPE.small,
    fontSize: 11,
    fontWeight: "500",
    color: "#8A8576",
    marginTop: 2,
    letterSpacing: -0.1,
  },
});

const listStyles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 0, // exactly 0px paddingTop so that gap to header is exactly 4px!
  },
  itemWrap: {
    // no extra styling — card handles it
  },
  separator: {
    height: 8,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    ...TYPE.h3,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    ...TYPE.small,
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
});
