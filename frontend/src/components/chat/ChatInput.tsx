import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Keyboard,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Send, Plus } from "lucide-react-native";
import { COLORS, RADII, SHADOWS, SPACING, TYPE } from "../../theme";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  bottomInset: number;
};

export function ChatInput({ value, onChangeText, onSend, bottomInset }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isActive = value.trim().length > 0;
  const activeProgress = useSharedValue(0);

  useEffect(() => {
    activeProgress.value = withTiming(isActive ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [isActive, activeProgress]);

  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText(text);
    },
    [onChangeText]
  );

  const handleSend = useCallback(() => {
    if (!isActive) return;
    onSend();
  }, [isActive, onSend]);

  // Animate only the background color
  const sendBtnStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      activeProgress.value,
      [0, 1],
      ["#C7C7CC", COLORS.blue]
    );
    return {
      backgroundColor,
    };
  });

  const dynamicPaddingBottom = keyboardVisible ? 4 : (bottomInset > 0 ? bottomInset : 4);

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: dynamicPaddingBottom },
      ]}
    >
      <BlurView intensity={60} tint="light" style={styles.blurWrap}>
        <View style={styles.inputRow}>
          {/* Attachment button */}
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Plus size={20} color={COLORS.textSecondary} strokeWidth={1.8} />
          </TouchableOpacity>

          {/* Text input field */}
          <View style={styles.fieldWrap}>
            <TextInput
              ref={inputRef}
              style={styles.field}
              value={value}
              onChangeText={handleChangeText}
              placeholder="Message..."
              placeholderTextColor={COLORS.textTertiary}
              testID="chat-input"
              returnKeyType="send"
              onSubmitEditing={handleSend}
              multiline
              maxLength={2000}
              blurOnSubmit={false}
              textAlignVertical="center"
            />
          </View>

          {/* Send button with smooth background color transition */}
          <AnimatedTouchable
            onPress={handleSend}
            disabled={!isActive}
            style={[styles.sendBtn, sendBtnStyle]}
            testID="chat-send"
            activeOpacity={0.8}
          >
            <Send size={17} color="#FFFFFF" strokeWidth={2.2} />
          </AnimatedTouchable>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingTop: 6,
  },
  blurWrap: {
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.80)",
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.04)",
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingLeft: 6,
    paddingRight: 6,
    paddingVertical: 5,
    gap: 2,
  },

  // Icon buttons (attachment, etc.)
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },

  // Input field container
  fieldWrap: {
    flex: 1,
    justifyContent: "center",
  },
  field: {
    fontSize: 15,
    color: COLORS.text,
    letterSpacing: -0.2,
    paddingVertical: Platform.OS === "ios" ? 8 : 6,
    paddingHorizontal: 6,
    maxHeight: 100,
    lineHeight: 20,
    ...(Platform.OS === "web" ? { outlineWidth: 0 } : {}),
  } as any,

  // Send button base style
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
