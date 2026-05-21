// Create modal — bottom sheet to choose what to create
import React, { useState } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { X, Calendar, MapPin, Image as ImgIcon, Sparkles } from "lucide-react-native";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../src/theme";
import { api } from "../src/api";

const OPTIONS = [
  { key: "event", label: "Create Event", desc: "Host a gathering, party or class", Icon: Calendar, color: COLORS.blue },
  { key: "spot", label: "Add a Spot", desc: "Share a favorite place", Icon: MapPin, color: "#E07A8B" },
  { key: "story", label: "Post a Story", desc: "Share a moment for 24h", Icon: ImgIcon, color: COLORS.gold },
];

export default function Create() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("Tomorrow · 7:00 PM");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const close = () => router.back();

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await api.createEvent({
        title,
        location: location || "San Francisco",
        date: new Date(Date.now() + 86400000).toISOString(),
        description: description || "Join us!",
      });
      router.replace("/(tabs)/discover");
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.sheetWrap}
        pointerEvents="box-none"
      >
        <View style={[styles.sheetShadow, { paddingBottom: insets.bottom + 24 }]}>
          <BlurView intensity={80} tint="light" style={styles.sheet}>
            <LinearGradient
              colors={["rgba(255,255,255,0.7)", "rgba(245,239,230,0.5)"]}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>
                {mode === "event" ? "New Event" : mode === "spot" ? "New Spot" : mode === "story" ? "New Story" : "Create"}
              </Text>
              <TouchableOpacity onPress={close} style={styles.closeBtn} testID="create-close">
                <X size={18} color={COLORS.text} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {!mode && (
              <View style={styles.options}>
                {OPTIONS.map((o) => (
                  <TouchableOpacity
                    key={o.key}
                    activeOpacity={0.9}
                    onPress={() => setMode(o.key)}
                    testID={`create-${o.key}`}
                    style={styles.optionShadow}
                  >
                    <View style={styles.option}>
                      <View style={[styles.optIcon, { backgroundColor: o.color }]}>
                        <o.Icon size={22} color="#FFF" strokeWidth={2.2} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.optLabel}>{o.label}</Text>
                        <Text style={styles.optDesc}>{o.desc}</Text>
                      </View>
                      <Sparkles size={14} color={COLORS.textTertiary} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {mode && (
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.fieldLabel}>Title</Text>
                <View style={styles.fieldShadow}>
                  <View style={styles.field}>
                    <TextInput
                      style={styles.input}
                      value={title}
                      onChangeText={setTitle}
                      placeholder="What's the vibe?"
                      placeholderTextColor={COLORS.textTertiary}
                      testID="create-title"
                    />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Location</Text>
                <View style={styles.fieldShadow}>
                  <View style={styles.field}>
                    <MapPin size={16} color={COLORS.textSecondary} />
                    <TextInput
                      style={[styles.input, { marginLeft: 8 }]}
                      value={location}
                      onChangeText={setLocation}
                      placeholder="Where?"
                      placeholderTextColor={COLORS.textTertiary}
                      testID="create-location"
                    />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>When</Text>
                <View style={styles.fieldShadow}>
                  <View style={styles.field}>
                    <Calendar size={16} color={COLORS.textSecondary} />
                    <TextInput
                      style={[styles.input, { marginLeft: 8 }]}
                      value={date}
                      onChangeText={setDate}
                      placeholder="Date & Time"
                      placeholderTextColor={COLORS.textTertiary}
                    />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Description</Text>
                <View style={styles.fieldShadow}>
                  <View style={[styles.field, { height: 90, alignItems: "flex-start", paddingTop: 12 }]}>
                    <TextInput
                      style={[styles.input, { height: "100%" }]}
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Tell people what to expect..."
                      placeholderTextColor={COLORS.textTertiary}
                      multiline
                    />
                  </View>
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity onPress={() => setMode(null)} style={styles.btnBack}>
                    <Text style={styles.btnBackLabel}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={submit}
                    style={styles.btnPrimary}
                    testID="create-submit"
                    activeOpacity={0.85}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.btnPrimaryLabel}>Publish</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "rgba(20,30,50,0.35)", justifyContent: "flex-end" },
  sheetWrap: { },
  sheetShadow: { ...SHADOWS.lg },
  sheet: {
    borderTopLeftRadius: RADII.xxl,
    borderTopRightRadius: RADII.xxl,
    paddingHorizontal: SPACING.lg,
    paddingTop: 8,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.5)",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  handleWrap: { alignItems: "center", paddingVertical: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(20,40,80,0.2)" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
    paddingTop: 4,
  },
  title: { ...TYPE.h2, fontSize: 22 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  options: { gap: 10, paddingBottom: 12, paddingTop: 4 },
  optionShadow: { ...SHADOWS.sm, borderRadius: RADII.lg },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: RADII.lg,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  optIcon: {
    width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  optLabel: { ...TYPE.h3, fontSize: 16 },
  optDesc: { ...TYPE.small, fontSize: 12, marginTop: 2 },
  fieldLabel: { ...TYPE.caption, color: COLORS.textSecondary, marginTop: 12, marginBottom: 6, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
  fieldShadow: { ...SHADOWS.sm, borderRadius: RADII.md },
  field: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 48,
    borderRadius: RADII.md,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  input: { flex: 1, fontSize: 14, color: COLORS.text, outlineWidth: 0 } as any,
  btnRow: { flexDirection: "row", gap: 10, marginTop: 18, marginBottom: 4 },
  btnBack: {
    flex: 1, paddingVertical: 14, borderRadius: RADII.pill, alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  btnBackLabel: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  btnPrimary: {
    flex: 2, paddingVertical: 14, borderRadius: RADII.pill, alignItems: "center", backgroundColor: COLORS.blue,
    ...SHADOWS.glow,
  },
  btnPrimaryLabel: { color: "#FFF", fontWeight: "700", fontSize: 14 },
});
