// Chats list — FIXED header/search/active row + FlatList for the conversations only
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Search, Edit3 } from "lucide-react-native";
import { api, ChatPreview } from "../../src/api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../src/theme";

export default function ChatsScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.chats().then(setChats).catch(() => {});
  }, []);

  const filtered = chats.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.last_message.toLowerCase().includes(query.toLowerCase())
  );

  const onlineChats = chats.filter((c) => c.online);

  const renderChat = useCallback(
    ({ item: c }: { item: ChatPreview }) => (
      <TouchableOpacity
        testID={`chat-${c.id}`}
        activeOpacity={0.85}
        onPress={() => router.push(`/chat/${c.id}` as any)}
        style={styles.chatShadow}
      >
        <BlurView intensity={50} tint="light" style={styles.chatCard}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: c.avatar }} style={styles.chatAvatar} />
            {c.online && <View style={styles.onlineDotSmall} />}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.chatRow1}>
              <Text style={styles.chatName} numberOfLines={1}>{c.name}</Text>
              <Text style={styles.chatTime}>{c.time}</Text>
            </View>
            <View style={styles.chatRow2}>
              <Text
                style={[styles.chatMsg, c.unread > 0 && styles.chatMsgUnread]}
                numberOfLines={1}
              >
                {c.last_message}
              </Text>
              {c.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>{c.unread}</Text>
                </View>
              )}
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    ),
    [router]
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {/* === FIXED TOP ZONE === */}
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Messages</Text>
            <Text style={styles.subtitle}>{chats.length} conversations</Text>
          </View>
          <TouchableOpacity style={styles.composeShadow} activeOpacity={0.85}>
            <BlurView intensity={60} tint="light" style={styles.compose}>
              <Edit3 size={18} color={COLORS.blue} strokeWidth={2.2} />
            </BlurView>
          </TouchableOpacity>
        </View>

        <View style={styles.searchShadow}>
          <BlurView intensity={60} tint="light" style={styles.search}>
            <Search size={16} color={COLORS.textSecondary} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations"
              placeholderTextColor={COLORS.textTertiary}
              value={query}
              onChangeText={setQuery}
              testID="chat-search"
              returnKeyType="search"
            />
          </BlurView>
        </View>

        {onlineChats.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Active now</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeRow}
            >
              {onlineChats.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.activeItem}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/chat/${c.id}` as any)}
                >
                  <View style={styles.activeAvatarWrap}>
                    <Image source={{ uri: c.avatar }} style={styles.activeAvatar} />
                    <View style={styles.onlineDot} />
                  </View>
                  <Text numberOfLines={1} style={styles.activeName}>
                    {c.name.split(" ")[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={styles.sectionTitle}>All chats</Text>
      </View>

      {/* === SCROLLABLE LIST ONLY === */}
      <FlatList
        style={styles.list}
        data={filtered}
        keyExtractor={(c) => c.id}
        renderItem={renderChat}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fixedTop: { paddingTop: 6 },
  list: { flex: 1 },
  listContent: { paddingTop: 4, paddingBottom: 140 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  title: { ...TYPE.hero, fontSize: 30 },
  subtitle: { ...TYPE.small, marginTop: 2 },
  composeShadow: { ...SHADOWS.sm, borderRadius: 22 },
  compose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  searchShadow: { ...SHADOWS.sm, marginHorizontal: SPACING.lg, borderRadius: RADII.pill },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADII.pill,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text, paddingVertical: 0, outlineWidth: 0 } as any,

  sectionTitle: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.6,
    marginTop: SPACING.xl,
    marginBottom: 10,
    marginHorizontal: SPACING.lg,
  },
  activeRow: { paddingHorizontal: SPACING.lg, gap: 12, paddingBottom: 4 },
  activeItem: { alignItems: "center", marginRight: 14, width: 64 },
  activeAvatarWrap: { position: "relative" },
  activeAvatar: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: COLORS.glassBorder },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2.5,
    borderColor: "#FFF",
  },
  activeName: { marginTop: 6, fontSize: 11, color: COLORS.text, fontWeight: "500" },

  chatShadow: { ...SHADOWS.sm, marginHorizontal: SPACING.lg, marginBottom: 10, borderRadius: RADII.lg },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADII.lg,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
    gap: 12,
  },
  avatarWrap: { position: "relative" },
  chatAvatar: { width: 50, height: 50, borderRadius: 25 },
  onlineDotSmall: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  chatRow1: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatName: { ...TYPE.bodyMed, fontSize: 15, flex: 1, marginRight: 8 },
  chatTime: { fontSize: 11, color: COLORS.textTertiary, fontWeight: "500" },
  chatRow2: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 3 },
  chatMsg: { flex: 1, fontSize: 13, color: COLORS.textSecondary, marginRight: 8 },
  chatMsgUnread: { color: COLORS.text, fontWeight: "600" },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.blue,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadCount: { color: "#FFF", fontSize: 11, fontWeight: "700" },
});
