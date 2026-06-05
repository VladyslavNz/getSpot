// Chat conversation screen — Redesigned with modern messaging UX
//
// Architecture:
// - ChatHeader: Floating blur header with unified participant info
// - FlatList with ChatBubble: Grouped messages with connected radii
// - ChatInput: Compact animated input bar
// - KeyboardAvoidingView: Native-feel keyboard sync (iOS padding, Android height)
//
// Design decisions:
// - Removed heavy borders/shadows for a lighter feel
// - Introduced message grouping with tight vertical spacing
// - Added subtle entrance animations via Reanimated
// - Send button springs to life when input is non-empty
// - Date separators with refined hairline dividers
// - Delivery indicators (checkmarks) on outgoing messages
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, Message, ChatPreview } from "../../src/api";
import { COLORS, SPACING } from "../../src/theme";
import {
  ChatHeader,
  HEADER_CONTENT_HEIGHT,
  ChatBubble,
  DateSeparator,
  computeMessageGroups,
  ChatInput,
} from "../../src/components/chat";

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [msgs, setMsgs] = useState<Message[]>([]);
  const [chat, setChat] = useState<ChatPreview | null>(null);
  const [input, setInput] = useState("");
  const [initialMsgCount, setInitialMsgCount] = useState<number>(-1);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (!id) return;
    api.messages(id).then((messages) => {
      setMsgs(messages);
      setInitialMsgCount(messages.length);
    });
    api.chats().then((cs) => setChat(cs.find((c) => c.id === id) || null));
  }, [id]);

  // Compute group positions for message grouping
  const groupPositions = useMemo(() => computeMessageGroups(msgs), [msgs]);

  const send = useCallback(async () => {
    if (!input.trim() || !id) return;
    const text = input;
    setInput("");
    const newMsg = await api.sendMessage(id, text);
    setMsgs((prev) => [...prev, newMsg]);
    requestAnimationFrame(() =>
      listRef.current?.scrollToEnd({ animated: true })
    );
  }, [input, id]);

  const headerTotalHeight = insets.top + HEADER_CONTENT_HEIGHT;

  const renderItem = useCallback(
    ({ item: m, index: i }: { item: Message; index: number }) => {
      const isMine = m.sender === "me";
      const position = groupPositions[i] || "single";

      // Show timestamp on last message of each group or single messages
      const showTimestamp =
        position === "last" || position === "single";

      // Only animate if it's added after initial load
      const shouldAnimate = initialMsgCount >= 0 && i >= initialMsgCount;

      return (
        <ChatBubble
          message={m}
          isMine={isMine}
          groupPosition={position}
          showTimestamp={showTimestamp}
          index={i}
          shouldAnimate={shouldAnimate}
        />
      );
    },
    [groupPositions, initialMsgCount]
  );

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Message list */}
        <FlatList
          ref={listRef}
          style={styles.list}
          data={msgs}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: headerTotalHeight + 12 },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
          initialNumToRender={20}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          // Add a date separator header for the conversation
          ListHeaderComponent={<DateSeparator date="Today" />}
        />

        {/* Input bar — moves with keyboard */}
        <ChatInput
          value={input}
          onChangeText={setInput}
          onSend={send}
          bottomInset={insets.bottom}
        />
      </KeyboardAvoidingView>

      {/* Floating header — covers status bar seamlessly */}
      <ChatHeader
        chat={chat}
        headerHeight={headerTotalHeight}
        statusBarHeight={insets.top}
        onBack={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  kav: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
});
