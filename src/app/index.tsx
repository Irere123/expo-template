import { useRouter } from "expo-router";
import {
  ArrowRight01Icon,
  BookOpen01Icon,
  Clock01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { Fragment, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { MainHeader } from "@/components/main-header";
import { getWordOfTheDay } from "@/utils/dictionary-api";
import { fonts } from "@/utils/fonts";
import { useHistory } from "@/utils/search-history";

export default function SearchScreen() {
  const router = useRouter();
  const { history, clearHistory } = useHistory();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const wotd = getWordOfTheDay();

  // iOS adds the bottom safe-area via contentInsetAdjustmentBehavior; Android
  // does not, so fold it in here. The extra gives breathing room above the
  // home indicator.
  const bottomPadding = (Platform.OS === "android" ? insets.bottom : 0) + 48;

  const openWord = (raw: string) => {
    const word = raw.trim().toLowerCase();
    if (!word) return;
    router.push({ pathname: "/word/[word]", params: { word } });
  };

  const submit = () => {
    // Validate that the search field is not empty before navigating.
    if (!query.trim()) {
      setError("Please enter a word to search.");
      return;
    }
    setError(null);
    Keyboard.dismiss();
    openWord(query);
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
        <View className="px-5 pt-4 pb-5">
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

        {/* Search box */}
        <View className="px-5">
          <View className="flex-row items-center gap-3 h-[52px] rounded-full bg-secondary px-4 border-continuous">
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
              returnKeyType="search"
              className="min-h-6 flex-1 p-0 text-[17px] text-foreground"
              placeholderTextColorClassName="accent-muted-foreground"
              cursorColorClassName="accent-foreground"
              selectionColorClassName="accent-foreground"
              underlineColorAndroidClassName="accent-transparent"
            />
          </View>

          {error && (
            <Text className="text-[13px] text-red-500 mt-2 ml-1">{error}</Text>
          )}

          <Pressable
            onPress={submit}
            accessibilityRole="button"
            className="bg-primary rounded-2xl mt-3 h-[52px] items-center justify-center active:opacity-80 border-continuous"
          >
            <Text className="text-[17px] font-semibold text-primary-foreground">
              Search
            </Text>
          </Pressable>
        </View>

        {/* Recent searches */}
        <View className="mt-9">
          <View className="flex-row items-center justify-between px-5 mb-1">
            <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Recent searches
            </Text>
            {history.length > 0 && (
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
            )}
          </View>

          {history.length > 0 ? (
            history.map((word, index) => (
              <Fragment key={word}>
                <Pressable
                  onPress={() => openWord(word)}
                  accessibilityRole="button"
                  className="flex-row items-center px-5 py-4 gap-3 active:bg-muted"
                >
                  <Icon icon={Clock01Icon} className="w-[18px] h-[18px] text-muted-foreground" />
                  <Text
                    numberOfLines={1}
                    className="flex-1 text-[17px] font-medium text-foreground capitalize"
                  >
                    {word}
                  </Text>
                  <Icon
                    icon={ArrowRight01Icon}
                    className="w-[18px] h-[18px] text-muted-foreground"
                  />
                </Pressable>
                {index < history.length - 1 && (
                  <View className="h-px bg-border mx-5" />
                )}
              </Fragment>
            ))
          ) : (
            <Text className="text-[15px] text-muted-foreground px-5 pt-1">
              Words you look up will show here. Try one below to get started.
            </Text>
          )}
        </View>

        {/* Word of the day */}
        <View className="mt-9 px-5">
          <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Word of the day
          </Text>
          <Pressable
            onPress={() => openWord(wotd.word)}
            accessibilityRole="button"
            accessibilityLabel={`Word of the day: ${wotd.word}`}
            className="rounded-2xl bg-secondary px-5 py-5 active:opacity-70 border-continuous"
          >
            <View className="flex-row items-baseline gap-2">
              <Text
                style={fonts.title}
                className="text-[24px] font-bold tracking-tight text-foreground capitalize"
              >
                {wotd.word}
              </Text>
              <Text
                style={fonts.readingItalic}
                className="text-sm italic text-muted-foreground"
              >
                {wotd.partOfSpeech}
              </Text>
            </View>
            <Text
              style={fonts.reading}
              className="text-[15px] text-muted-foreground mt-2 leading-relaxed"
            >
              {wotd.gloss}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <MainHeader />
    </>
  );
}
