import {
  ArrowRight01Icon,
  BookOpen01Icon,
  Clock01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { MainHeader } from "@/components/main-header";
import {
  EXPLORE_WORDS,
  getWordOfTheDay,
  validateWord,
} from "@/utils/dictionary-api";
import { fonts } from "@/utils/fonts";
import { haptics } from "@/utils/haptics";
import { useHistory } from "@/utils/search-history";

/** Gentle staggered entrance for each section on mount. */
const enter = (delay: number) => FadeInDown.duration(420).delay(delay);

export default function SearchScreen() {
  const router = useRouter();
  const { history, clearHistory } = useHistory();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const wotd = getWordOfTheDay();
  const bottomPadding = (Platform.OS === "android" ? insets.bottom : 0) + 48;

  const openWord = (raw: string) => {
    const word = raw.trim().toLowerCase();
    if (!word) return;
    haptics.selection();
    router.push({ pathname: "/word/[word]", params: { word } });
  };

  const submit = () => {
    // Strict validation: reject empty, multi-word, numeric, or symbol input
    // with a clear, specific message before navigating.
    const result = validateWord(query);
    if (!result.ok) {
      haptics.warning();
      setError(result.message);
      return;
    }
    setError(null);
    Keyboard.dismiss();
    openWord(result.word);
    setQuery("");
  };

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <Animated.View entering={enter(0)}>
          <View className="px-5 pt-2 pb-5">
            <View className="w-12 h-12 rounded-2xl bg-primary items-center justify-center mb-4 border-continuous">
              <Icon icon={BookOpen01Icon} className="w-6 h-6 text-primary-foreground" />
            </View>
            <Text
              style={fonts.display}
              className="text-[34px] font-bold tracking-tight text-foreground leading-tight"
            >
              Dictionary
            </Text>
            <Text className="text-[15px] text-muted-foreground mt-2 leading-snug">
              Look up any word for meanings, pronunciation, and examples.
            </Text>
          </View>
        </Animated.View>

        {/* Search — pill with an inline submit */}
        <Animated.View entering={enter(60)}>
          <View className="px-5">
            <View className="flex-row items-center gap-3 h-[58px] rounded-full bg-secondary pl-5 pr-2 border-continuous">
              <Icon icon={Search01Icon} className="h-5 w-5 text-muted-foreground" />
              <TextInput
                value={query}
                onChangeText={(text) => {
                  setQuery(text);
                  if (error) setError(null);
                }}
                onSubmitEditing={submit}
                placeholder="Search a word"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
                maxLength={60}
                returnKeyType="search"
                submitBehavior="submit"
                className="min-h-6 flex-1 p-0 text-[17px] text-foreground"
                placeholderTextColorClassName="accent-muted-foreground"
                cursorColorClassName="accent-foreground"
                selectionColorClassName="accent-foreground"
                underlineColorAndroidClassName="accent-transparent"
              />
              <Pressable
                onPress={submit}
                accessibilityRole="button"
                accessibilityLabel="Search"
                className="w-11 h-11 rounded-full bg-primary items-center justify-center active:opacity-80"
              >
                <Icon icon={ArrowRight01Icon} className="w-5 h-5 text-primary-foreground" />
              </Pressable>
            </View>
            {error && (
              <Text
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
                className="text-[13px] text-red-500 mt-2 ml-4"
              >
                {error}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Word of the day — feature card */}
        <Animated.View entering={enter(130)}>
          <View className="px-5 mt-6">
            <Pressable
              onPress={() => openWord(wotd.word)}
              accessibilityRole="button"
              accessibilityLabel={`Word of the day: ${wotd.word}`}
              className="rounded-3xl bg-primary-soft px-5 py-5 active:opacity-80 border-continuous"
            >
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-1.5 h-1.5 rounded-full bg-primary" />
                <Text className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Word of the day
                </Text>
              </View>
              <Text
                style={fonts.title}
                className="text-[30px] font-bold tracking-tight text-foreground capitalize leading-tight"
              >
                {wotd.word}
              </Text>
              <Text
                style={fonts.readingItalic}
                className="text-[15px] italic text-muted-foreground mt-1"
              >
                {wotd.partOfSpeech}
              </Text>
              <Text
                style={fonts.reading}
                className="text-[15px] text-foreground leading-relaxed mt-2"
              >
                {wotd.gloss}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-4">
                <Text className="text-sm font-semibold text-primary">
                  Explore word
                </Text>
                <Icon icon={ArrowRight01Icon} className="w-4 h-4 text-primary" />
              </View>
            </Pressable>
          </View>
        </Animated.View>

        {/* Recent — horizontal quick-tap chips */}
        {history.length > 0 && (
          <Animated.View entering={enter(200)}>
            <View className="mt-8">
              <View className="flex-row items-center justify-between px-5 mb-3">
                <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Recent
                </Text>
                <Pressable
                  onPress={clearHistory}
                  accessibilityRole="button"
                  hitSlop={8}
                  className="active:opacity-60"
                >
                  <Text className="text-sm font-medium text-foreground">
                    Clear
                  </Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerClassName="px-5 gap-2.5"
              >
                {history.slice(0, 12).map((word) => (
                  <Pressable
                    key={word}
                    onPress={() => openWord(word)}
                    accessibilityRole="button"
                    className="flex-row items-center gap-2 rounded-full bg-secondary px-4 py-2.5 active:opacity-60 border-continuous"
                  >
                    <Icon icon={Clock01Icon} className="w-3.5 h-3.5 text-muted-foreground" />
                    <Text className="text-[15px] font-medium text-foreground capitalize">
                      {word}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        )}

        {/* Explore — discovery chips */}
        <Animated.View entering={enter(history.length > 0 ? 270 : 200)}>
          <View className="mt-8 px-5">
            <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Explore
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {EXPLORE_WORDS.map((word) => (
                <Pressable
                  key={word}
                  onPress={() => openWord(word)}
                  accessibilityRole="button"
                  className="rounded-full border border-border bg-card px-4 py-2.5 active:opacity-60 border-continuous"
                >
                  <Text className="text-[15px] font-medium text-foreground capitalize">
                    {word}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <MainHeader />
    </>
  );
}
