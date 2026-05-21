// Chat detail screen
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [chat, setChat] = useState<ChatPreview | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!id) return;
    api.messages(id).then(setMsgs);
    api.chats().then((cs) => setChat(cs.find((c) => c.id === id) || null));
  }, [id]);

  const send = async () => {
    if (!input.trim() || !id) return;
    const text = input;
    setInput("");
    const newMsg = await api.sendMessage(id, text);
    setMsgs((prev) => [...prev, newMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BlurView intensity={70} tint="light" style={styles.headerBlur}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="chat-back">
            <ChevronLeft size={22} color={COLORS.text} strokeWidth={2.4} />
          </TouchableOpacity>
          {chat && (
            <View style={styles.headerCenter}>
              <View style={styles.headerAvatarWrap}>
                <Image source={{ uri: chat.avatar }} style={styles.headerAvatar} />
                {chat.online && <View style={styles.headerOnline} />}
              </View>
              <View>
                <Text style={styles.headerName}>{chat.name}</Text>
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
        </BlurView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={10}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.list}
          contentContainerStyle={{ padding: SPACING.lg, paddingTop: 110, paddingBottom: 80 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {msgs.map((m) => {
            const mine = m.sender === "me";
            return (
              <View key={m.id} style={[styles.bubbleRow, { justifyContent: mine ? "flex-end" : "flex-start" }]}>
                <View
                  style={[
                    styles.bubble,
                    mine ? styles.bubbleMine : styles.bubbleTheirs,
                  ]}
                >
                  <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{m.text}</Text>
                  <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>{m.time}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
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
            />
            <TouchableOpacity onPress={send} style={styles.sendBtn} testID="chat-send">
              <Send size={18} color="#FFF" strokeWidth={2.2} />
            </TouchableOpacity>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    left: 0, right: 0, top: 0,
    zIndex: 10,
  },
  headerBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatarWrap: { position: "relative" },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  headerOnline: {
    position: "absolute", bottom: -1, right: -1, width: 11, height: 11, borderRadius: 5.5,
    backgroundColor: COLORS.success, borderWidth: 2, borderColor: "#FFF",
  },
  headerName: { ...TYPE.bodyMed, fontSize: 15 },
  headerStatus: { fontSize: 11, color: COLORS.success, fontWeight: "500", marginTop: 1 },
  headerIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },

  list: { flex: 1 },
  bubbleRow: { flexDirection: "row", marginBottom: 8 },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleMine: {
    backgroundColor: COLORS.blue,
    borderBottomRightRadius: 6,
    ...SHADOWS.sm,
  },
  bubbleTheirs: {
    backgroundColor: "rgba(255,255,255,0.92)",
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
    flexDirection: "row", alignItems: "center",
    paddingLeft: 16, paddingRight: 6, paddingVertical: 6,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1, borderColor: COLORS.glassBorder,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  inputField: { flex: 1, fontSize: 14, color: COLORS.text, paddingVertical: 8, outlineWidth: 0 } as any,
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.blue, alignItems: "center", justifyContent: "center",
    ...SHADOWS.glow,
  },
});
