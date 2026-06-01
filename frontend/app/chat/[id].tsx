// Chat conversation — Telegram/iMessage-style architecture
// - Header BlurView fills from top:0 (no gap, covers status bar zone)
// - FlatList for messages (proper scroll virtualization)
// - KeyboardAvoidingView w/ behavior="padding" — RN bridges this to iOS
//   keyboardWillShow/keyboardWillChangeFrame natively, so timing+curve match
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { ChevronLeft, Phone, Video, Send } from "lucide-react-native";
import { api, Message, ChatPreview } from "../../src/api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../src/theme";

const HEADER_HEIGHT = 56; // content height (excluding status bar inset)

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [msgs, setMsgs] = useState<Message[]>([]);
  const [chat, setChat] = useState<ChatPreview | null>(null);
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (!id) return;
    api.messages(id).then(setMsgs);
    api.chats().then((cs) => setChat(cs.find((c) => c.id === id) || null));
  }, [id]);

  const send = useCallback(async () => {
    if (!input.trim() || !id) return;
    const text = input;
    setInput("");
    const newMsg = await api.sendMessage(id, text);
    setMsgs((prev) => [...prev, newMsg]);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, [input, id]);

  const renderItem = useCallback(({ item: m }: { item: Message }) => {
    const mine = m.sender === "me";
    return (
      <View style={[styles.bubbleRow, { justifyContent: mine ? "flex-end" : "flex-start" }]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{m.text}</Text>
          <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>{m.time}</Text>
        </View>
      </View>
    );
  }, []);

  const headerTotalHeight = insets.top + HEADER_HEIGHT;

  return (
    <View style={styles.root}>
      {/* === KAV is the FLEX:1 PARENT — handles keyboard natively === */}
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* List sits between header and input. paddingTop reserves header height. */}
        <FlatList
          ref={listRef}
          style={styles.list}
          data={msgs}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingTop: headerTotalHeight + 8 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          initialNumToRender={20}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        />

        {/* Input bar — sits at bottom of KAV, moves with keyboard */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <BlurView intensity={70} tint="light" style={styles.inputBlur}>
            <TextInput
              style={styles.inputField}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message"
              placeholderTextColor={COLORS.textTertiary}
              testID="chat-input"
              returnKeyType="send"
              onSubmitEditing={send}
              multiline
              maxLength={1000}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={send}
              style={styles.sendBtn}
              testID="chat-send"
              activeOpacity={0.85}
            >
              <Send size={18} color="#FFF" strokeWidth={2.2} />
            </TouchableOpacity>
          </BlurView>
        </View>
      </KeyboardAvoidingView>

      {/* === FIXED HEADER — BlurView covers top:0 (status bar + content) === */}
      <BlurView intensity={70} tint="light" style={[styles.header, { height: headerTotalHeight }]}>
        <View style={[styles.headerInner, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="chat-back">
            <ChevronLeft size={22} color={COLORS.text} strokeWidth={2.4} />
          </TouchableOpacity>
          {chat && (
            <View style={styles.headerCenter}>
              <View style={styles.headerAvatarWrap}>
                <Image source={{ uri: chat.avatar }} style={styles.headerAvatar} />
                {chat.online && <View style={styles.headerOnline} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerName} numberOfLines={1}>{chat.name}</Text>
                <Text style={styles.headerStatus}>{chat.online ? "Active now" : "Offline"}</Text>
              </View>
            </View>
          )}
          <View style={{ flexDirection: "row", gap: 4 }}>
            <TouchableOpacity style={styles.headerIcon}>
              <Phone size={18} color={COLORS.blue} strokeWidth={2.2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Video size={18} color={COLORS.blue} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  // Header — absolute, fills from top:0 (covers status bar zone seamlessly)
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  headerInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 4,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatarWrap: { position: "relative" },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  headerOnline: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  headerName: { ...TYPE.bodyMed, fontSize: 15 },
  headerStatus: { fontSize: 11, color: COLORS.success, fontWeight: "500", marginTop: 1 },
  headerIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },

  kav: { flex: 1 },
  list: { flex: 1 },
  listContent: { padding: SPACING.lg, paddingBottom: 12 },

  bubbleRow: { flexDirection: "row", marginBottom: 8 },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleMine: {
    backgroundColor: COLORS.blue,
    borderBottomRightRadius: 6,
    ...SHADOWS.sm,
  },
  bubbleTheirs: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.sm,
  },
  bubbleText: { fontSize: 14, color: COLORS.text, lineHeight: 19 },
  bubbleTextMine: { color: "#FFF" },
  bubbleTime: { fontSize: 10, color: COLORS.textTertiary, marginTop: 4, alignSelf: "flex-end" },
  bubbleTimeMine: { color: "rgba(255,255,255,0.75)" },

  inputBar: { paddingHorizontal: SPACING.md, paddingTop: 8 },
  inputBlur: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 10,
    maxHeight: 120,
    outlineWidth: 0,
  } as any,
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginLeft: 4,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.glow,
  },
});
