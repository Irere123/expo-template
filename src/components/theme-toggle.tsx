import { Moon, Sun } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Icon } from "@/components/icon";
import { useThemePreference } from "@/utils/theme";

/**
 * Header light/dark toggle. Shows the current mode — a sun in light, a moon in
 * dark — and morphs between them on tap. "System" is the initial default;
 * tapping makes the choice explicit and persists it (see {@link useThemePreference}).
 */
export function ThemeToggle() {
  const { setPreference } = useThemePreference();
  const isDark = useColorScheme() === "dark";
  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isDark ? 1 : 0, {
      duration: 340,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [isDark, progress]);

  const sunStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { rotate: `${progress.value * 120}deg` },
      { scale: 1 - 0.4 * progress.value },
    ],
  }));

  const moonStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { rotate: `${(progress.value - 1) * 120}deg` },
      { scale: 0.6 + 0.4 * progress.value },
    ],
  }));

  return (
    <Pressable
      onPress={() => setPreference(isDark ? "light" : "dark")}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={
        isDark ? "Switch to light mode" : "Switch to dark mode"
      }
      className="w-10 h-10 items-center justify-center -mr-1.5 active:opacity-60"
    >
      <View className="w-6 h-6">
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.center, sunStyle]}
        >
          <Icon icon={Sun} className="w-6 h-6 text-foreground" />
        </Animated.View>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.center, moonStyle]}
        >
          <Icon icon={Moon} className="w-[22px] h-[22px] text-foreground" />
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});
