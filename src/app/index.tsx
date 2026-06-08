import { useRouter } from "expo-router";
import {
  BookOpenText,
  ChevronRight,
  Clock,
  Search,
  Sparkles,
} from "lucide-react-native";
import { useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Icon } from "@/components/icon";
import { MainHeader } from "@/components/main-header";
import { getWordOfTheDay } from "@/utils/dictionary-api";
import { useHistory } from "@/utils/search-history";

export default function SearchScreen() {
  const router = useRouter();
  const { history, clearHistory } = useHistory();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const wotd = getWordOfTheDay();

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
  };

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="android:pb-safe pb-10"
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View className="px-5 pt-4 pb-5">
          <View className="w-12 h-12 rounded-2xl bg-secondary items-center justify-center mb-4 border-continuous">
            <Icon icon={BookOpenText} className="w-6 h-6 text-foreground" />
          </View>
          <Text className="text-[34px] font-bold tracking-tight text-foreground leading-tight">
            Dictionary
          </Text>
          <Text className="text-[15px] text-muted-foreground mt-2 leading-snug">
            Look up any word for meanings, pronunciation, and examples.
          </Text>
        </View>

        {/* Search box */}
        <View className="px-5">
          <View className="flex-row items-center gap-3 h-[52px] rounded-full bg-secondary px-4 border-continuous">
            <Icon icon={Search} className="h-5 w-5 text-muted-foreground" />
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
            className="bg-foreground rounded-2xl mt-3 h-[52px] items-center justify-center active:opacity-80 border-continuous"
          >
            <Text className="text-[17px] font-semibold text-background">
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
            history.map((word) => (
              <Pressable
                key={word}
                onPress={() => openWord(word)}
                accessibilityRole="button"
                className="flex-row items-center px-5 py-4 gap-3 border-b border-border active:bg-muted"
              >
                <Icon icon={Clock} className="w-[18px] h-[18px] text-muted-foreground" />
                <Text
                  numberOfLines={1}
                  className="flex-1 text-[17px] font-medium text-foreground capitalize"
                >
                  {word}
                </Text>
                <Icon
                  icon={ChevronRight}
                  className="w-[18px] h-[18px] text-muted-foreground"
                />
              </Pressable>
            ))
          ) : (
            <Text className="text-[15px] text-muted-foreground px-5 pt-1">
              Words you look up will show here. Try one below to get started.
            </Text>
          )}
        </View>

        {/* Word of the day */}
        <View className="mt-9 px-5">
          <View className="flex-row items-center gap-2 mb-3">
            <Icon icon={Sparkles} className="w-3.5 h-3.5 text-muted-foreground" />
            <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Word of the day
            </Text>
          </View>
          <Pressable
            onPress={() => openWord(wotd.word)}
            accessibilityRole="button"
            accessibilityLabel={`Word of the day: ${wotd.word}`}
            className="rounded-2xl bg-secondary px-5 py-5 active:opacity-70 border-continuous"
          >
            <View className="flex-row items-baseline gap-2">
              <Text className="text-[22px] font-bold tracking-tight text-foreground capitalize">
                {wotd.word}
              </Text>
              <Text className="text-sm italic text-muted-foreground">
                {wotd.partOfSpeech}
              </Text>
            </View>
            <Text className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {wotd.gloss}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <MainHeader />
    </>
  );
}
