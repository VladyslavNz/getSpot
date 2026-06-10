// LayersBottomSheet — Independent map content filter sheet
// Architecture: completely isolated from TopSpotsBottomSheet
//   • Own BottomSheet ref (forwardRef)
//   • Own snap points ["35%"]
//   • Own open/close/change callbacks
//   • No shared state with any other sheet
import React, { useCallback, useMemo, forwardRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Layers, MapPin, Calendar } from "lucide-react-native";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../theme";

// ─── Exported filter type ─────────────────────────────────────────────────────
export type MapContentFilter = "all" | "places" | "events";

// ─── Filter options (static, no runtime allocation) ───────────────────────────
type FilterOption = {
  key: MapContentFilter;
  label: string;
  Icon: React.ComponentType<any>;
  color: string;
};

const FILTER_OPTIONS: FilterOption[] = [
  { key: "all", label: "All", Icon: Layers, color: COLORS.text },
  { key: "places", label: "Places", Icon: MapPin, color: "#E07A8B" },
  { key: "events", label: "Events", Icon: Calendar, color: COLORS.blue },
];

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  /** Currently active filter */
  activeFilter: MapContentFilter;
  /** Called when the user selects a filter option */
  onFilterChange: (filter: MapContentFilter) => void;
  /** Called when the sheet opens or closes (for toggle button state) */
  onOpenChange?: (isOpen: boolean) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────
const LayersBottomSheet = forwardRef<BottomSheet, Props>(
  function LayersBottomSheet({ activeFilter, onFilterChange, onOpenChange }, ref) {
    // Single snap point — compact filter panel (35%)
    const snapPoints = useMemo(() => ["35%"], []);

    // Report open/close state to parent for toggle button logic only
    const handleChange = useCallback(
      (index: number) => {
        onOpenChange?.(index >= 0);
      },
      [onOpenChange]
    );

    // Apply filter and auto-close
    const handleFilterSelect = useCallback(
      (filter: MapContentFilter) => {
        onFilterChange(filter);
        if (ref && "current" in ref) {
          ref.current?.close();
        }
      },
      [onFilterChange, ref]
    );

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      []
    );

    return (
      <BottomSheet
        ref={ref}
        snapPoints={snapPoints}
        onChange={handleChange}
        index={-1}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={styles.container}>
          <Text style={styles.headerTitle}>Map Layers</Text>
          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Show on map</Text>

          <View style={styles.optionsList}>
            {FILTER_OPTIONS.map((opt) => {
              const isSelected = activeFilter === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={({ pressed }) => [
                    styles.optionRow,
                    isSelected && styles.optionRowSelected,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={() => handleFilterSelect(opt.key)}
                >
                  <View style={styles.optionLeft}>
                    <opt.Icon size={18} color={opt.color} strokeWidth={2.2} />
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && { borderColor: opt.color },
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: opt.color },
                        ]}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </BottomSheet>
    );
  }
);

export default LayersBottomSheet;

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  background: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.glassBorderSoft,
  },
  handleIndicator: {
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    width: 36,
    height: 4,
    borderRadius: 2,
  },
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
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    ...TYPE.caption,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
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
