// Create modal — overhauled bottom sheet to choose and create events or spots with dynamic transitions and native pan dragging
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Dimensions,
  LayoutAnimation,
  Animated,
  PanResponder,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Calendar,
  MapPin,
  Sparkles,
  Globe,
  Activity,
  Coffee,
  Briefcase,
  Palette,
  Heart,
  Clock,
  ArrowRight,
  ChevronRight,
  Camera,
  Plus,
  Image as ImgIcon,
} from "lucide-react-native";
import { Image } from "expo-image";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../src/theme";
import { api } from "../src/api";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const OPTIONS = [
  {
    key: "event",
    label: "Create Event",
    desc: "Host a gathering, party, or wellness flow",
    Icon: Calendar,
    color: COLORS.blue,
  },
  {
    key: "spot",
    label: "Add a Spot",
    desc: "Share a cafe, bar, or hidden local gem",
    Icon: MapPin,
    color: "#E07A8B",
  },
];

const EVENT_TYPES = [
  { key: "cultural", label: "Cultural", Icon: Globe },
  { key: "activity", label: "Activity", Icon: Activity },
  { key: "informal", label: "Informal", Icon: Coffee },
  { key: "professional", label: "Professional", Icon: Briefcase },
  { key: "creative", label: "Creative", Icon: Palette },
  { key: "health", label: "Health", Icon: Heart },
];

const SPOT_CATEGORIES = [
  { key: "cafe", label: "Cafe", Icon: Coffee },
  { key: "restaurant", label: "Restaurant", Icon: Sparkles },
  { key: "bar", label: "Bar", Icon: GlassIcon },
  { key: "park", label: "Park", Icon: Globe },
];

const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1717231856724-5e52b126a6d1?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  "https://images.pexels.com/photos/10578910/pexels-photo-10578910.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/6968861/pexels-photo-6968861.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.unsplash.com/photo-1554499299-d3ec6385c514?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  "https://images.unsplash.com/photo-1563902242731-bcde8ffa1d36?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  "https://images.unsplash.com/photo-1717231855727-06fa2b4c431c?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
];

const SPOT_PRESETS = [
  "https://images.unsplash.com/photo-1648808694138-6706c5efc80a?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  "https://images.pexels.com/photos/34624845/pexels-photo-34624845.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/32704881/pexels-photo-32704881.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.unsplash.com/photo-1638882267964-0d9764607947?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  "https://images.unsplash.com/photo-1493246318656-5bfd4cfb29b8?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
];

export default function Create() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<string | null>(null);

  // Event State Variables
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("Tomorrow, June 2, 2026");
  const [startTime, setStartTime] = useState("6:30 PM");
  const [endTime, setEndTime] = useState("8:30 PM");
  const [eventType, setEventType] = useState("informal");
  const [capacity, setCapacity] = useState("50");
  const [selectedImage, setSelectedImage] = useState(COVER_PRESETS[0]);

  // Spot State Variables
  const [spotName, setSpotName] = useState("");
  const [spotAddress, setSpotAddress] = useState("");
  const [spotCategory, setSpotCategory] = useState("cafe");
  const [spotRating, setSpotRating] = useState("4.7");
  const [spotDescription, setSpotDescription] = useState("");
  const [selectedSpotImage, setSelectedSpotImage] = useState(SPOT_PRESETS[0]);

  const [saving, setSaving] = useState(false);

  // Pan dragging entry & close animations
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    // Spring in on mount
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [translateY]);

  const close = () => {
    // Smooth timing close animation
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  const selectMode = (m: string | null) => {
    // Premium spring height change transitions
    if (Platform.OS !== "web") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setMode(m);
  };

  const cycleImage = () => {
    const nextIdx = (COVER_PRESETS.indexOf(selectedImage) + 1) % COVER_PRESETS.length;
    setSelectedImage(COVER_PRESETS[nextIdx]);
  };

  const cycleSpotImage = () => {
    const nextIdx = (SPOT_PRESETS.indexOf(selectedSpotImage) + 1) % SPOT_PRESETS.length;
    setSelectedSpotImage(SPOT_PRESETS[nextIdx]);
  };

  const submit = async () => {
    setSaving(true);
    try {
      if (mode === "event") {
        if (!title.trim()) return;
        await api.createEvent({
          title,
          location: location || "San Francisco",
          date: new Date(Date.now() + 86400000).toISOString(),
          description: description || "Join us for this amazing gathering!",
          event_type: eventType,
          capacity: parseInt(capacity) || 50,
          image: selectedImage,
        });
      } else {
        if (!spotName.trim()) return;
        await api.createEvent({
          title: spotName,
          location: spotAddress || "San Francisco",
          date: new Date().toISOString(),
          description: spotDescription || `Perfect spot rating: ${spotRating}`,
          category: spotCategory,
          image: selectedSpotImage,
        });
      }
      router.replace("/(tabs)/discover");
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  // Drag-to-close Pan Responder system
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      // Only drag on move events, letting standard touch events pass to close button or title taps
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 4 && gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const activeSheetH = mode ? SCREEN_HEIGHT * 0.9 : SCREEN_HEIGHT * 0.35;
        const dismissThreshold = activeSheetH * 0.35; // 35% component height threshold

        if (gestureState.dy > dismissThreshold || gestureState.vy > 0.5) {
          close();
        } else {
          // Snap back smoothly
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 70,
            friction: 12,
          }).start();
        }
      },
    })
  ).current;

  // Proportional sizing & padding
  const sheetHeight = mode ? SCREEN_HEIGHT * 0.9 : SCREEN_HEIGHT * 0.35;
  const bottomPadding = mode ? Math.max(insets.bottom, 16) + 16 : Math.max(insets.bottom, 12) + 12;

  return (
    <View style={styles.root}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />

      <View style={styles.sheetWrap} pointerEvents="box-none">
        <Animated.View style={[styles.sheetShadow, { transform: [{ translateY }] }]}>
          <BlurView
            intensity={85}
            tint="light"
            style={[styles.sheet, { height: sheetHeight, paddingBottom: bottomPadding }]}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.75)", "rgba(245,239,230,0.55)"]}
              style={StyleSheet.absoluteFill}
            />

            {/* Drag Handle & Header Area (Active Drag Zone) */}
            <View {...panResponder.panHandlers} style={styles.dragAreaZone}>
              <View style={styles.handleWrap}>
                <View style={styles.handle} />
              </View>

              <View style={styles.header}>
                <Text style={styles.title}>
                  {mode === "event" ? "New Event" : mode === "spot" ? "New Spot" : "Create"}
                </Text>
                <TouchableOpacity onPress={close} style={styles.closeBtn} testID="create-close">
                  <X size={16} color={COLORS.text} strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            </View>

            {/* ACTION SELECTION SCREEN (Balanced 2-Column Row Grid) */}
            {!mode && (
              <View style={styles.options}>
                {OPTIONS.map((o) => (
                  <TouchableOpacity
                    key={o.key}
                    activeOpacity={0.9}
                    onPress={() => selectMode(o.key)}
                    testID={`create-${o.key}`}
                    style={styles.optionShadow}
                  >
                    <View style={styles.option}>
                      <View style={[styles.optIcon, { backgroundColor: o.color }]}>
                        <o.Icon size={22} color="#FFF" strokeWidth={2.2} />
                      </View>
                      <Text style={styles.optLabel}>{o.label}</Text>
                      <Text style={styles.optDesc}>{o.desc}</Text>
                      <View style={styles.pillHighlight}>
                        <Sparkles size={11} color={COLORS.blue} style={{ marginRight: 3 }} />
                        <Text style={styles.pillHighlightText}>Select</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* CREATE EVENT REDESIGNED FORM (visually fixed layout with native keyboard overlay on iOS) */}
            {mode === "event" && (
              <KeyboardAvoidingView
                behavior={undefined}
                style={styles.keyboardAvoid}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  style={styles.formScroll}
                  showsVerticalScrollIndicator={false}
                  automaticallyAdjustKeyboardInsets={false}
                  automaticallyAdjustContentInsets={false}
                  contentInsetAdjustmentBehavior="never"
                >
                  {/* PHOTO SECTION */}
                  <Text style={styles.fieldLabel}>Photo (optional)</Text>
                  <Text style={styles.fieldSubtext}>Tap first card to cycle through premium cover presets</Text>
                  <View style={styles.photoRow}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={cycleImage}
                      style={[styles.photoCard, { borderColor: COLORS.blue, borderWidth: 1.5 }]}
                    >
                      <Image source={{ uri: selectedImage }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                      <View style={styles.cameraOverlay}>
                        <Camera size={20} color="#FFF" strokeWidth={2.2} />
                        <Text style={styles.photoIndex}>Cover Preset</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.photoCardEmpty}>
                      <ImgIcon size={20} color={COLORS.textTertiary} />
                      <Text style={styles.photoIndexEmpty}>Photo 2</Text>
                    </View>

                    <View style={styles.photoCardEmpty}>
                      <ImgIcon size={20} color={COLORS.textTertiary} />
                      <Text style={styles.photoIndexEmpty}>Photo 3</Text>
                    </View>
                  </View>

                  {/* EVENT TYPE GRID */}
                  <Text style={styles.fieldLabel}>Event Type *</Text>
                  <Text style={styles.fieldSubtext}>Choose category to filter discover feeds</Text>
                  <View style={styles.grid}>
                    {EVENT_TYPES.map((type) => {
                      const active = eventType === type.key;
                      return (
                        <TouchableOpacity
                          key={type.key}
                          activeOpacity={0.8}
                          onPress={() => setEventType(type.key)}
                          style={[styles.gridCard, active && styles.gridCardActive]}
                        >
                          <View style={[styles.gridIconWrap, active && styles.gridIconWrapActive]}>
                            <type.Icon size={16} color={active ? COLORS.blue : COLORS.textSecondary} strokeWidth={2.2} />
                          </View>
                          <Text style={[styles.gridLabel, active && styles.gridLabelActive]}>{type.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* TITLE WITH COUNTER */}
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.fieldLabel}>Title *</Text>
                    <Text style={[styles.counterText, title.length < 3 && styles.counterAlert]}>
                      {title.length}/100 chars (min 3)
                    </Text>
                  </View>
                  <View style={styles.fieldShadow}>
                    <View style={styles.field}>
                      <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="What's the vibe?"
                        placeholderTextColor={COLORS.textTertiary}
                        maxLength={100}
                        testID="create-title"
                      />
                    </View>
                  </View>

                  {/* DATE & TIME (Inspired by Reference) */}
                  <Text style={styles.fieldLabel}>Date & Time *</Text>
                  <View style={styles.fieldShadow}>
                    <View style={styles.field}>
                      <Calendar size={15} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
                      <TextInput
                        style={styles.input}
                        value={date}
                        onChangeText={setDate}
                        placeholder="Date (e.g. 1 June 2026)"
                        placeholderTextColor={COLORS.textTertiary}
                      />
                    </View>
                  </View>

                  {/* Start/End Time side-by-side */}
                  <View style={styles.timeRow}>
                    <View style={[styles.timeCol, styles.fieldShadow]}>
                      <Text style={styles.timeLabel}>Start Time</Text>
                      <View style={styles.timeField}>
                        <Clock size={14} color={COLORS.textSecondary} />
                        <TextInput
                          style={styles.timeInput}
                          value={startTime}
                          onChangeText={setStartTime}
                          placeholder="6:30 PM"
                          placeholderTextColor={COLORS.textTertiary}
                        />
                      </View>
                    </View>

                    <View style={styles.timeArrow}>
                      <ArrowRight size={14} color={COLORS.textTertiary} strokeWidth={2.4} />
                    </View>

                    <View style={[styles.timeCol, styles.fieldShadow]}>
                      <Text style={styles.timeLabel}>End Time</Text>
                      <View style={styles.timeField}>
                        <Clock size={14} color={COLORS.textSecondary} />
                        <TextInput
                          style={styles.timeInput}
                          value={endTime}
                          onChangeText={setEndTime}
                          placeholder="8:30 PM"
                          placeholderTextColor={COLORS.textTertiary}
                        />
                      </View>
                    </View>
                  </View>

                  {/* LOCATION & CITY INDICATION */}
                  <Text style={styles.fieldLabel}>Location *</Text>
                  <View style={styles.fieldShadow}>
                    <View style={styles.field}>
                      <MapPin size={15} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
                      <TextInput
                        style={styles.input}
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Enter venue address or landmark"
                        placeholderTextColor={COLORS.textTertiary}
                        testID="create-location"
                      />
                    </View>
                  </View>

                  {/* Apple-style shown in city panel */}
                  <View style={[styles.cityCard, styles.fieldShadow]}>
                    <View style={styles.cityIndicator}>
                      <MapPin size={12} color="#FFF" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.cityTag}>SHOWN TO USERS IN</Text>
                      <Text style={styles.cityName}>San Francisco Region</Text>
                    </View>
                    <ChevronRight size={14} color={COLORS.textSecondary} />
                  </View>

                  {/* CAPACITY */}
                  <Text style={styles.fieldLabel}>Max Participants (2-500) *</Text>
                  <View style={styles.fieldShadow}>
                    <View style={styles.field}>
                      <Plus size={15} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
                      <TextInput
                        style={styles.input}
                        value={capacity}
                        onChangeText={setCapacity}
                        placeholder="10"
                        placeholderTextColor={COLORS.textTertiary}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {/* DESCRIPTION WITH COUNTER */}
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.fieldLabel}>Description *</Text>
                    <Text style={[styles.counterText, description.length < 10 && styles.counterAlert]}>
                      {description.length}/1000 chars (min 10)
                    </Text>
                  </View>
                  <View style={styles.fieldShadow}>
                    <View style={[styles.field, { height: 96, alignItems: "flex-start", paddingTop: 12 }]}>
                      <TextInput
                        style={[styles.input, { height: "100%", textAlignVertical: "top" }]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Tell people what to expect, what to bring, and key details..."
                        placeholderTextColor={COLORS.textTertiary}
                        multiline
                        maxLength={1000}
                      />
                    </View>
                  </View>

                  {/* ACTION BUTTON ROW */}
                  <View style={styles.btnRow}>
                    <TouchableOpacity onPress={() => selectMode(null)} style={styles.btnBack}>
                      <Text style={styles.btnBackLabel}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={submit}
                      style={styles.btnPrimary}
                      testID="create-submit"
                      activeOpacity={0.85}
                      disabled={saving || title.length < 3 || description.length < 10}
                    >
                      {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnPrimaryLabel}>Publish</Text>}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            )}

            {/* ADD SPOT FORM (with local keyboard behavior) */}
            {mode === "spot" && (
              <KeyboardAvoidingView
                behavior={undefined}
                style={styles.keyboardAvoid}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  style={styles.formScroll}
                  showsVerticalScrollIndicator={false}
                  automaticallyAdjustKeyboardInsets={false}
                  automaticallyAdjustContentInsets={false}
                  contentInsetAdjustmentBehavior="never"
                >
                  {/* PHOTO SECTION */}
                  <Text style={styles.fieldLabel}>Spot Image</Text>
                  <Text style={styles.fieldSubtext}>Tap photo to select beautiful venue imagery presets</Text>
                  <View style={styles.photoRow}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={cycleSpotImage}
                      style={[styles.photoCard, { borderColor: "#E07A8B", borderWidth: 1.5 }]}
                    >
                      <Image source={{ uri: selectedSpotImage }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                      <View style={styles.cameraOverlay}>
                        <Camera size={20} color="#FFF" strokeWidth={2.2} />
                        <Text style={styles.photoIndex}>Spot Preset</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.photoCardEmpty}>
                      <ImgIcon size={20} color={COLORS.textTertiary} />
                      <Text style={styles.photoIndexEmpty}>Thumbnail</Text>
                    </View>

                    <View style={styles.photoCardEmpty}>
                      <ImgIcon size={20} color={COLORS.textTertiary} />
                      <Text style={styles.photoIndexEmpty}>Interior</Text>
                    </View>
                  </View>

                  {/* SPOT CATEGORY SELECTOR */}
                  <Text style={styles.fieldLabel}>Category *</Text>
                  <View style={styles.grid}>
                    {SPOT_CATEGORIES.map((cat) => {
                      const active = spotCategory === cat.key;
                      return (
                        <TouchableOpacity
                          key={cat.key}
                          activeOpacity={0.8}
                          onPress={() => setSpotCategory(cat.key)}
                          style={[styles.gridCard, active && styles.gridCardActive, active && { borderColor: "#E07A8B" }]}
                        >
                          <View style={[styles.gridIconWrap, active && { backgroundColor: "rgba(224,122,139,0.15)" }]}>
                            <cat.Icon size={16} color={active ? "#E07A8B" : COLORS.textSecondary} strokeWidth={2.2} />
                          </View>
                          <Text style={[styles.gridLabel, active && { color: "#E07A8B", fontWeight: "600" }]}>
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* SPOT NAME */}
                  <Text style={styles.fieldLabel}>Spot Name *</Text>
                  <View style={styles.fieldShadow}>
                    <View style={styles.field}>
                      <TextInput
                        style={styles.input}
                        value={spotName}
                        onChangeText={setSpotName}
                        placeholder="e.g. Ember & Oak Cafe"
                        placeholderTextColor={COLORS.textTertiary}
                        testID="create-title"
                      />
                    </View>
                  </View>

                  {/* RATING */}
                  <Text style={styles.fieldLabel}>Rating (1.0 - 5.0) *</Text>
                  <View style={styles.fieldShadow}>
                    <View style={styles.field}>
                      <Sparkles size={15} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
                      <TextInput
                        style={styles.input}
                        value={spotRating}
                        onChangeText={setSpotRating}
                        placeholder="4.7"
                        placeholderTextColor={COLORS.textTertiary}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {/* ADDRESS */}
                  <Text style={styles.fieldLabel}>Full Address *</Text>
                  <View style={styles.fieldShadow}>
                    <View style={styles.field}>
                      <MapPin size={15} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
                      <TextInput
                        style={styles.input}
                        value={spotAddress}
                        onChangeText={setSpotAddress}
                        placeholder="e.g. 55 Grove Street, SF, CA"
                        placeholderTextColor={COLORS.textTertiary}
                        testID="create-location"
                      />
                    </View>
                  </View>

                  {/* DESCRIPTION */}
                  <Text style={styles.fieldLabel}>Review / Description</Text>
                  <View style={styles.fieldShadow}>
                    <View style={[styles.field, { height: 80, alignItems: "flex-start", paddingTop: 12 }]}>
                      <TextInput
                        style={[styles.input, { height: "100%", textAlignVertical: "top" }]}
                        value={spotDescription}
                        onChangeText={setSpotDescription}
                        placeholder="What makes this spot special?"
                        placeholderTextColor={COLORS.textTertiary}
                        multiline
                      />
                    </View>
                  </View>

                  {/* ACTION BUTTON ROW */}
                  <View style={styles.btnRow}>
                    <TouchableOpacity onPress={() => selectMode(null)} style={styles.btnBack}>
                      <Text style={styles.btnBackLabel}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={submit}
                      style={[styles.btnPrimary, { backgroundColor: "#E07A8B", shadowColor: "#E07A8B" }]}
                      testID="create-submit"
                      activeOpacity={0.85}
                      disabled={saving || !spotName.trim()}
                    >
                      {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnPrimaryLabel}>Add Spot</Text>}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            )}
          </BlurView>
        </Animated.View>
      </View>
    </View>
  );
}

// Fallback GlassIcon
function GlassIcon(props: any) {
  return <Sparkles {...props} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "rgba(10,20,35,0.45)", justifyContent: "flex-end" },
  sheetWrap: {},
  sheetShadow: {
    ...SHADOWS.lg,
  },
  sheet: {
    borderTopLeftRadius: RADII.xxl,
    borderTopRightRadius: RADII.xxl,
    paddingHorizontal: SPACING.lg,
    paddingTop: 8,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  dragAreaZone: {
    width: "100%",
  },
  handleWrap: { alignItems: "center", paddingVertical: 8 },
  handle: { width: 44, height: 5, borderRadius: 2.5, backgroundColor: "rgba(20,40,80,0.15)" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
    paddingTop: 4,
  },
  title: { ...TYPE.h2, fontSize: 21, fontWeight: "700" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },

  // Action Selection Cards (2-Column horizontal row)
  options: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 24,
    paddingTop: 8,
  },
  optionShadow: {
    flex: 1,
    ...SHADOWS.sm,
    borderRadius: RADII.xl,
  },
  option: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 22,
    paddingHorizontal: 12,
    borderRadius: RADII.xl,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    minHeight: 164,
  },
  optIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    ...SHADOWS.sm,
  },
  optLabel: {
    ...TYPE.h3,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    color: COLORS.text,
  },
  optDesc: {
    ...TYPE.small,
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 10,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  pillHighlight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blueLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADII.pill,
  },
  pillHighlightText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.blue,
    textTransform: "uppercase",
  },

  // Keyboard avoidance internal container style
  keyboardAvoid: {
    flex: 1,
  },
  formScroll: {
    flex: 1,
  },

  // Redesigned Creation Form styling
  fieldHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 14,
    marginBottom: 6,
  },
  fieldLabel: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    marginTop: 14,
    marginBottom: 6,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldSubtext: {
    ...TYPE.small,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: -4,
    marginBottom: 8,
  },
  counterText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textTertiary,
  },
  counterAlert: {
    color: COLORS.danger,
  },
  fieldShadow: { ...SHADOWS.sm, borderRadius: RADII.md },
  field: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 48,
    borderRadius: RADII.md,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
  },
  input: { flex: 1, fontSize: 14, color: COLORS.text, outlineWidth: 0 } as any,

  // Photo uploads
  photoRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    marginBottom: 6,
  },
  photoCard: {
    width: 82,
    height: 104,
    borderRadius: RADII.md,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "flex-end",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoIndex: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  photoCardEmpty: {
    width: 82,
    height: 104,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(20,40,80,0.12)",
    backgroundColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  photoIndexEmpty: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textTertiary,
  },

  // 6-Category Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  gridCard: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: RADII.md,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 1.5,
    borderColor: COLORS.glassBorderSoft,
  },
  gridCardActive: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderColor: COLORS.blue,
    ...SHADOWS.sm,
  },
  gridIconWrap: {
    width: 32,
    height: 32,
    borderRadius: RADII.sm,
    backgroundColor: "rgba(20,40,80,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridIconWrapActive: {
    backgroundColor: COLORS.blueLight,
  },
  gridLabel: {
    ...TYPE.bodyMed,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  gridLabelActive: {
    color: COLORS.blue,
    fontWeight: "700",
  },

  // Date and Time selectors
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 12,
    marginBottom: 6,
    gap: 8,
  },
  timeCol: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginLeft: 2,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  timeField: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: RADII.md,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
  },
  timeInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    marginLeft: 6,
    outlineWidth: 0,
  } as any,
  timeArrow: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 4,
  },

  // City display panel
  cityCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 6,
    padding: 12,
    borderRadius: RADII.md,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
  },
  cityIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  cityTag: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  cityName: {
    ...TYPE.bodyMed,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 1,
  },

  // Primary Buttons
  btnRow: { flexDirection: "row", gap: 10, marginTop: 24, marginBottom: 8 },
  btnBack: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADII.pill,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
  },
  btnBackLabel: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  btnPrimary: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: RADII.pill,
    alignItems: "center",
    backgroundColor: COLORS.blue,
    ...SHADOWS.glow,
  },
  btnPrimaryLabel: { color: "#FFF", fontWeight: "700", fontSize: 14 },
});
