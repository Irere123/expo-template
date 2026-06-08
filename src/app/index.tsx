import { useRouter } from "expo-router";
import { BookOpenText, ChevronRight, Clock, Search } from "lucide-react-native";
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
import { useHistory } from "@/utils/search-history";

export default function SearchScreen() {
  const router = useRouter();
  const { history, clearHistory } = useHistory();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

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
          <View className="w-12 h-12 rounded-2xl bg-foreground items-center justify-center mb-4 border-continuous">
            <Icon icon={BookOpenText} className="w-6 h-6 text-background" />
          </View>
          <Text className="text-[28px] font-bold text-foreground">
            Dictionary
          </Text>
          <Text className="text-[17px] text-muted-foreground mt-1 leading-snug">
            Search any English word for meanings, pronunciations, and example
            sentences.
          </Text>
        </View>

        {/* Search box */}
        <View className="px-5">
          <View className="flex-row items-center gap-2 rounded-xl bg-muted px-3 py-2.5 border-continuous">
            <Icon icon={Search} className="h-4 w-4 text-muted-foreground" />
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
            className="bg-foreground rounded-xl mt-3 py-3.5 items-center active:opacity-80 border-continuous"
          >
            <Text className="text-[17px] font-semibold text-background">
              Search
            </Text>
          </Pressable>
        </View>

        {/* Recent searches */}
        {history.length > 0 ? (
          <View className="mt-8">
            <View className="flex-row items-center justify-between px-5 pb-2">
              <Text className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recent searches
              </Text>
              <Pressable
                onPress={clearHistory}
                accessibilityRole="button"
                className="active:opacity-60"
              >
                <Text className="text-[13px] text-muted-foreground">Clear</Text>
              </Pressable>
            </View>
            {history.map((word) => (
              <Pressable
                key={word}
                onPress={() => openWord(word)}
                className="flex-row items-center px-5 py-3.5 gap-3.5 active:bg-muted"
              >
                <Icon icon={Clock} className="w-4 h-4 text-muted-foreground" />
                <Text
                  numberOfLines={1}
                  className="flex-1 text-[17px] text-foreground capitalize"
                >
                  {word}
                </Text>
                <Icon
                  icon={ChevronRight}
                  className="w-3.5 h-3.5 text-muted-foreground"
                />
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="items-center px-10 pt-16 gap-2">
            <Icon icon={Search} className="w-9 h-9 text-muted-foreground" />
            <Text className="text-[15px] text-muted-foreground text-center">
              Your searched words will appear here.
            </Text>
          </View>
        )}
      </ScrollView>

      <MainHeader />
    </>
  );
}
