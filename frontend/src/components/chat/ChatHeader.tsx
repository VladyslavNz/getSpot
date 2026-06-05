// ChatHeader — Premium header with unified participant info block
// Inspired by image8's clean hierarchy: avatar + name + status as a unified block
// Maintains getSpot brand palette and glassmorphism language
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import { ChevronLeft, Phone, Video, MoreHorizontal } from "lucide-react-native";
import Animated, {
  FadeIn,
  FadeInRight,
} from "react-native-reanimated";
import { ChatPreview } from "../../api";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../theme";

type Props = {
  chat: ChatPreview | null;
  headerHeight: number;
  statusBarHeight: number;
  onBack: () => void;
};

const CONTENT_HEIGHT = 52;

export function ChatHeader({ chat, headerHeight, statusBarHeight, onBack }: Props) {
  return (
    <BlurView
      intensity={80}
      tint="light"
      style={[styles.header, { height: headerHeight }]}
    >
      <View
        style={[
          styles.headerInner,
          { paddingTop: statusBarHeight },
        ]}
      >
        {/* Back button — clean, minimal hit target */}
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          testID="chat-back"
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={24} color={COLORS.text} strokeWidth={2} />
        </TouchableOpacity>

        {/* Unified participant info block */}
        {chat && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.participantBlock}>
            {/* Avatar with online indicator */}
            <View style={styles.avatarContainer}>
              <Image source={{ uri: chat.avatar }} style={styles.avatar} />
              {chat.online && (
                <Animated.View
                  entering={FadeIn.delay(200).duration(400)}
                  style={styles.onlineIndicator}
                />
              )}
            </View>

            {/* Name + status stacked */}
            <View style={styles.nameBlock}>
              <Text style={styles.displayName} numberOfLines={1}>
                {chat.name}
              </Text>
              <Text
                style={[
                  styles.statusText,
                  chat.online && styles.statusOnline,
                ]}
              >
                {chat.online ? "Active now" : "Offline"}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Action icons — balanced spacing */}
        <Animated.View entering={FadeInRight.delay(100).duration(250)} style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Phone size={19} color={COLORS.blue} strokeWidth={1.8} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Video size={19} color={COLORS.blue} strokeWidth={1.8} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </BlurView>
  );
}

export { CONTENT_HEIGHT as HEADER_CONTENT_HEIGHT };

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
    backgroundColor: "rgba(245, 239, 230, 0.82)",
    overflow: "hidden",
  },
  headerInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingBottom: 10,
  },

  // Back button
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },

  // Unified participant block — avatar + name + status
  participantBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.beige,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2.5,
    borderColor: COLORS.cream, // matches bg for seamless look
  },

  // Name + status
  nameBlock: {
    flex: 1,
    justifyContent: "center",
  },
  displayName: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.3,
    color: COLORS.text,
    lineHeight: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: -0.1,
    color: COLORS.textSecondary,
    marginTop: 1,
    lineHeight: 16,
  },
  statusOnline: {
    color: COLORS.success,
    fontWeight: "500",
  },

  // Action buttons
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginLeft: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
  },
});
