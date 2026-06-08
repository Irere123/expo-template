import { Bookmark01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useCSSVariable } from "uniwind";

import { useBookmarks } from "@/utils/bookmarks";

/**
 * Header toggle that saves / unsaves the current word. The bookmark fills when
 * saved and gives a small pop on tap. Rendered only once a word has loaded.
 */
export function BookmarkButton({ word }: { word: string }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const foreground = useCSSVariable("--app-foreground") as string;
  const primary = useCSSVariable("--app-primary") as string;
  const active = isBookmarked(word);

  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPress = () => {
    scale.value = withSequence(
      withTiming(0.8, { duration: 90 }),
      withSpring(1, { damping: 6, stiffness: 220 }),
    );
    toggleBookmark(word);
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={
        active ? `Remove ${word} from bookmarks` : `Bookmark ${word}`
      }
      className="w-10 h-10 items-center justify-center -mr-1.5 active:opacity-60"
    >
      <Animated.View style={style}>
        <HugeiconsIcon
          icon={Bookmark01Icon}
          size={23}
          color={active ? primary : foreground}
          fill={active ? primary : "none"}
          strokeWidth={1.8}
        />
      </Animated.View>
    </Pressable>
  );
}
