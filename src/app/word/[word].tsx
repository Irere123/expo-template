import { useLocalSearchParams, useRouter } from "expo-router";
import { FileQuestion, RotateCw, SearchX, WifiOff } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AudioButton } from "@/components/audio-button";
import { Icon } from "@/components/icon";
import {
  DictionaryError,
  fetchWord,
  getPhoneticText,
  getPronunciations,
  suggestWords,
  type WordEntry,
} from "@/utils/dictionary-api";
import { fonts } from "@/utils/fonts";
import { useHistory } from "@/utils/search-history";

type State =
  | { status: "loading" }
  | { status: "success"; data: WordEntry[] }
  | { status: "error"; error: DictionaryError };

export default function WordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ word: string }>();
  const word = (params.word ?? "").trim();
  const { addWord, history } = useHistory();

  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await fetchWord(word);
      setState({ status: "success", data });
      // Only add to history once we know the word actually exists.
      addWord(data[0]?.word ?? word);
    } catch (err) {
      const error =
        err instanceof DictionaryError
          ? err
          : new DictionaryError("unknown", "Something went wrong.");
      setState({ status: "error", error });
    }
  }, [word, addWord]);

  useEffect(() => {
    load();
  }, [load]);

  // Tapping a synonym looks it up as a new search (pushed so Back returns here).
  const onSelectWord = useCallback(
    (next: string) => {
      const target = next.trim().toLowerCase();
      if (!target || target === word.toLowerCase()) return;
      router.push({ pathname: "/word/[word]", params: { word: target } });
    },
    [router, word],
  );

  return (
    <View className="flex-1 bg-background">
      {state.status === "loading" && <LoadingState word={word} />}

      {state.status === "error" && (
        <ErrorState
          error={state.error}
          word={word}
          suggestions={
            state.error.kind === "not-found" ? suggestWords(word, history) : []
          }
          onRetry={load}
          onGoBack={() => (router.canGoBack() ? router.back() : router.replace("/"))}
          onSearchAgain={() => router.navigate("/")}
          onSuggest={(suggestion) =>
            router.replace({
              pathname: "/word/[word]",
              params: { word: suggestion },
            })
          }
        />
      )}

      {state.status === "success" && (
        <WordDetails entries={state.data} onSelectWord={onSelectWord} />
      )}
    </View>
  );
}

function LoadingState({ word }: { word: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-6 px-8">
      {word ? (
        <Text
          numberOfLines={1}
          style={fonts.display}
          className="text-[34px] font-bold tracking-tight text-foreground opacity-20 capitalize"
        >
          {word}
        </Text>
      ) : null}
      <View className="items-center gap-3">
        <ActivityIndicator />
        <Text className="text-sm tracking-wide text-muted-foreground">
          Searching…
        </Text>
      </View>
    </View>
  );
}

function ActionButton({
  label,
  variant,
  icon,
  onPress,
}: {
  label: string;
  variant: "primary" | "secondary";
  icon?: typeof RotateCw;
  onPress: () => void;
}) {
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`flex-1 h-[52px] flex-row items-center justify-center gap-2 rounded-2xl border-continuous ${
        primary ? "bg-foreground active:opacity-80" : "bg-secondary active:opacity-70"
      }`}
    >
      {icon && (
        <Icon
          icon={icon}
          className={`w-[18px] h-[18px] ${primary ? "text-background" : "text-foreground"}`}
        />
      )}
      <Text
        className={`text-[17px] font-semibold ${primary ? "text-background" : "text-foreground"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ErrorState({
  error,
  word,
  suggestions,
  onRetry,
  onGoBack,
  onSearchAgain,
  onSuggest,
}: {
  error: DictionaryError;
  word: string;
  suggestions: string[];
  onRetry: () => void;
  onGoBack: () => void;
  onSearchAgain: () => void;
  onSuggest: (word: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const notFound = error.kind === "not-found";
  const network = error.kind === "network";

  const icon = notFound ? SearchX : network ? WifiOff : FileQuestion;
  const headline = notFound
    ? "No definitions found"
    : network
      ? "No connection"
      : "Something went wrong";
  const helper = notFound
    ? `We couldn't find “${word}”. Double-check the spelling or try another word.`
    : network
      ? "You're offline. Check your internet connection and try again."
      : error.message;

  return (
    <View className="flex-1">
      {/* Centered message */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-[88px] h-[88px] rounded-[28px] bg-secondary items-center justify-center border-continuous">
          <Icon icon={icon} className="w-9 h-9 text-foreground" />
        </View>

        <Text
          style={fonts.title}
          className="mt-6 text-[22px] font-bold tracking-tight text-foreground text-center"
        >
          {headline}
        </Text>
        <Text className="mt-3 max-w-[300px] text-[15px] leading-relaxed text-muted-foreground text-center">
          {helper}
        </Text>

        {/* Did you mean? */}
        {notFound && suggestions.length > 0 && (
          <View className="items-center mt-8">
            <Text className="text-sm text-muted-foreground">Did you mean?</Text>
            <View className="flex-row flex-wrap justify-center gap-2.5 mt-3">
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => onSuggest(suggestion)}
                  accessibilityRole="button"
                  className="rounded-full bg-secondary px-3.5 py-1.5 active:opacity-60 border-continuous"
                >
                  <Text className="text-sm font-medium text-foreground">
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Pinned actions */}
      <View
        className="px-5 pt-4 gap-3"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        {notFound ? (
          <View className="flex-row gap-3">
            <ActionButton label="Go back" variant="secondary" onPress={onGoBack} />
            <ActionButton
              label="Search again"
              variant="primary"
              onPress={onSearchAgain}
            />
          </View>
        ) : (
          <View className="gap-3">
            <ActionButton
              label="Retry"
              variant="primary"
              icon={RotateCw}
              onPress={onRetry}
            />
            <ActionButton label="Go back" variant="secondary" onPress={onGoBack} />
          </View>
        )}
      </View>
    </View>
  );
}

function WordDetails({
  entries,
  onSelectWord,
}: {
  entries: WordEntry[];
  onSelectWord: (word: string) => void;
}) {
  const headword = entries[0]?.word ?? "";
  const phonetic = getPhoneticText(entries);
  const pronunciations = getPronunciations(entries);

  return (
    <ScrollView
      className="flex-1"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="android:pb-safe px-5 pb-12"
    >
      {/* Headword + phonetics + audio */}
      <View className="pt-3 pb-6">
        <Text
          style={fonts.display}
          className="text-[40px] font-bold tracking-tight text-foreground leading-tight capitalize"
        >
          {headword}
        </Text>
        {phonetic && (
          <Text className="text-[17px] text-muted-foreground tracking-wide mt-2">
            {phonetic}
          </Text>
        )}
        {pronunciations.length > 0 && (
          <View className="flex-row flex-wrap gap-2.5 mt-4">
            {pronunciations.map((p) => (
              <AudioButton key={p.url} url={p.url} label={p.label} />
            ))}
          </View>
        )}
      </View>

      {/* Meanings grouped by part of speech */}
      {entries.flatMap((entry, entryIndex) =>
        entry.meanings.map((meaning, meaningIndex) => (
          <MeaningBlock
            key={`${entryIndex}-${meaningIndex}-${meaning.partOfSpeech}`}
            meaning={meaning}
            onSelectWord={onSelectWord}
          />
        )),
      )}
    </ScrollView>
  );
}

function MeaningBlock({
  meaning,
  onSelectWord,
}: {
  meaning: WordEntry["meanings"][number];
  onSelectWord: (word: string) => void;
}) {
  return (
    <View className="mb-8">
      {/* Part of speech */}
      <View className="flex-row items-center gap-4 mb-4">
        <Text
          style={fonts.readingItalic}
          className="text-[17px] italic text-foreground"
        >
          {meaning.partOfSpeech}
        </Text>
        <View className="flex-1 h-px bg-border" />
      </View>

      {/* Definitions */}
      <View className="gap-5">
        {meaning.definitions.map((def, index) => (
          <View key={`${index}-${def.definition}`} className="flex-row gap-3">
            <Text className="text-[17px] font-medium text-foreground">
              {index + 1}.
            </Text>
            <View className="flex-1">
              <Text
                style={fonts.reading}
                className="text-[17px] text-foreground leading-relaxed"
              >
                {def.definition}
              </Text>
              {def.example && (
                <Text
                  style={fonts.readingItalic}
                  className="text-[15px] text-muted-foreground italic leading-relaxed mt-2"
                >
                  “{def.example}”
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Synonyms */}
      {meaning.synonyms && meaning.synonyms.length > 0 && (
        <View className="mt-5">
          <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Synonyms
          </Text>
          <View className="flex-row flex-wrap gap-2 mt-3">
            {meaning.synonyms.slice(0, 8).map((synonym) => (
              <Pressable
                key={synonym}
                onPress={() => onSelectWord(synonym)}
                accessibilityRole="button"
                accessibilityLabel={`Look up ${synonym}`}
                className="rounded-full bg-secondary px-3.5 py-1.5 active:opacity-60 border-continuous"
              >
                <Text className="text-sm text-foreground">{synonym}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
