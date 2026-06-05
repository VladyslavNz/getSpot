// ChatBubble — Modern message bubble with grouping support
// Refined shapes, improved readability, delivery indicators, and cohesive grouping
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { Check, CheckCheck } from "lucide-react-native";
import { Message } from "../../api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../theme";

type GroupPosition = "single" | "first" | "middle" | "last";

type Props = {
  message: Message;
  isMine: boolean;
  groupPosition: GroupPosition;
  showTimestamp: boolean;
  index: number;
  shouldAnimate?: boolean;
};

/**
 * Compute border radii based on group position for connected bubble feel.
 * Uses a large default radius with a small "tail" radius on the connected side.
 */
function getBubbleRadii(isMine: boolean, position: GroupPosition) {
  const lg = 20;
  const sm = 6;

  if (isMine) {
    switch (position) {
      case "single":
        return { borderTopLeftRadius: lg, borderTopRightRadius: lg, borderBottomLeftRadius: lg, borderBottomRightRadius: sm };
      case "first":
        return { borderTopLeftRadius: lg, borderTopRightRadius: lg, borderBottomLeftRadius: lg, borderBottomRightRadius: sm };
      case "middle":
        return { borderTopLeftRadius: lg, borderTopRightRadius: sm, borderBottomLeftRadius: lg, borderBottomRightRadius: sm };
      case "last":
        return { borderTopLeftRadius: lg, borderTopRightRadius: sm, borderBottomLeftRadius: lg, borderBottomRightRadius: lg };
    }
  } else {
    switch (position) {
      case "single":
        return { borderTopLeftRadius: lg, borderTopRightRadius: lg, borderBottomLeftRadius: sm, borderBottomRightRadius: lg };
      case "first":
        return { borderTopLeftRadius: lg, borderTopRightRadius: lg, borderBottomLeftRadius: sm, borderBottomRightRadius: lg };
      case "middle":
        return { borderTopLeftRadius: sm, borderTopRightRadius: lg, borderBottomLeftRadius: sm, borderBottomRightRadius: lg };
      case "last":
        return { borderTopLeftRadius: sm, borderTopRightRadius: lg, borderBottomLeftRadius: lg, borderBottomRightRadius: lg };
    }
  }
}

export const ChatBubble = React.memo(function ChatBubble({
  message,
  isMine,
  groupPosition,
  showTimestamp,
  index,
  shouldAnimate = false,
}: Props) {
  const radii = useMemo(() => getBubbleRadii(isMine, groupPosition), [isMine, groupPosition]);

  // Tighter vertical spacing within groups
  const marginBottom = groupPosition === "last" || groupPosition === "single" ? 12 : 3;

  return (
    <View>
      <Animated.View
        entering={
          shouldAnimate
            ? (isMine
                ? FadeInUp.duration(150)
                : FadeInDown.duration(150))
            : undefined
        }
        style={[
          styles.row,
          { justifyContent: isMine ? "flex-end" : "flex-start", marginBottom },
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleTheirs,
            radii,
          ]}
        >
          <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
            {message.text}
          </Text>

          {/* Timestamp + delivery indicator row */}
          {showTimestamp && (
            <View style={styles.metaRow}>
              <Text style={[styles.timestamp, isMine && styles.timestampMine]}>
                {message.time}
              </Text>
              {isMine && (
                <CheckCheck
                  size={13}
                  color="rgba(255,255,255,0.6)"
                  strokeWidth={2}
                  style={styles.deliveryIcon}
                />
              )}
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
});

// Date separator component
export function DateSeparator({ date }: { date: string }) {
  return (
    <View style={styles.dateSeparator}>
      <View style={styles.dateLine} />
      <Text style={styles.dateText}>{date}</Text>
      <View style={styles.dateLine} />
    </View>
  );
}

/**
 * Compute group positions for a list of messages.
 * Adjacent messages from the same sender are grouped together.
 */
export function computeMessageGroups(messages: Message[]): GroupPosition[] {
  return messages.map((msg, i) => {
    const prev = i > 0 ? messages[i - 1] : null;
    const next = i < messages.length - 1 ? messages[i + 1] : null;
    const sameSenderPrev = prev?.sender === msg.sender;
    const sameSenderNext = next?.sender === msg.sender;

    if (!sameSenderPrev && !sameSenderNext) return "single";
    if (!sameSenderPrev && sameSenderNext) return "first";
    if (sameSenderPrev && sameSenderNext) return "middle";
    return "last"; // sameSenderPrev && !sameSenderNext
  });
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
  },
  bubble: {
    maxWidth: "76%",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  // Outgoing — brand blue
  bubbleMine: {
    backgroundColor: COLORS.blue,
    ...SHADOWS.sm,
  },

  // Incoming — clean white glass
  bubbleTheirs: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.04)",
    ...SHADOWS.sm,
  },

  messageText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  messageTextMine: {
    color: "#FFFFFF",
  },

  // Timestamp + delivery indicator
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 3,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: "400",
    letterSpacing: 0.1,
  },
  timestampMine: {
    color: "rgba(255,255,255,0.55)",
  },
  deliveryIcon: {
    marginTop: 0.5,
  },

  // Date separator
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.xxl,
    paddingVertical: 20,
    gap: 12,
  },
  dateLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.divider,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textTertiary,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
});
