import { AudioButton } from "@/components/audio-button";
import { Icon } from "@/components/icon";
import {
  DictionaryError,
  fetchWord,
  getPhoneticText,
  getPronunciations,
  type WordEntry,
} from "@/utils/dictionary-api";
import { useHistory } from "@/utils/search-history";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { FileQuestion, RotateCw, WifiOff } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

type State =
  | { status: "loading" }
  | { status: "success"; data: WordEntry[] }
  | { status: "error"; error: DictionaryError };

export default function WordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ word: string }>();
  const word = (params.word ?? "").trim();
  const { addWord } = useHistory();

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

  const title = word ? word[0].toUpperCase() + word.slice(1) : "Word";

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{ title, headerLargeTitleShadowVisible: false }}
      />

      {state.status === "loading" && <LoadingState />}

      {state.status === "error" && (
        <ErrorState
          error={state.error}
          onRetry={load}
          onGoBack={() => router.back()}
        />
      )}

      {state.status === "success" && <WordDetails entries={state.data} />}
    </View>
  );
}

function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center gap-3">
      <ActivityIndicator />
      <Text className="text-[15px] text-muted-foreground">Searching…</Text>
    </View>
  );
}

function ErrorState({
  error,
  onRetry,
  onGoBack,
}: {
  error: DictionaryError;
  onRetry: () => void;
  onGoBack: () => void;
}) {
  const notFound = error.kind === "not-found";
  const network = error.kind === "network";

  return (
    <View className="flex-1 items-center justify-center px-10 gap-3">
      <View className="w-14 h-14 rounded-2xl bg-muted items-center justify-center">
        <Icon
          icon={network ? WifiOff : FileQuestion}
          className="w-7 h-7 text-muted-foreground"
        />
      </View>
      <Text className="text-[20px] font-semibold text-foreground text-center">
        {notFound
          ? "Word not found"
          : network
            ? "No connection"
            : "Something went wrong"}
      </Text>
      <Text className="text-[15px] text-muted-foreground text-center leading-snug">
        {error.message}
      </Text>

      <View className="flex-row gap-3 mt-2">
        <Pressable
          onPress={onGoBack}
          accessibilityRole="button"
          className="rounded-xl bg-muted px-5 py-3 active:opacity-70 border-continuous"
        >
          <Text className="text-[15px] font-medium text-foreground">
            Go back
          </Text>
        </Pressable>
        {!notFound && (
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            className="flex-row items-center gap-2 rounded-xl bg-foreground px-5 py-3 active:opacity-80 border-continuous"
          >
            <Icon icon={RotateCw} className="w-4 h-4 text-background" />
            <Text className="text-[15px] font-semibold text-background">
              Retry
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function WordDetails({ entries }: { entries: WordEntry[] }) {
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
      <View className="pt-4 pb-5">
        <Text className="text-[34px] font-bold text-foreground leading-tight capitalize">
          {headword}
        </Text>
        {phonetic && (
          <Text className="text-[17px] text-muted-foreground mt-1">
            {phonetic}
          </Text>
        )}
        {pronunciations.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-4">
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
          />
        )),
      )}
    </ScrollView>
  );
}

function MeaningBlock({
  meaning,
}: {
  meaning: WordEntry["meanings"][number];
}) {
  return (
    <View className="mb-7">
      {/* Part of speech */}
      <View className="flex-row items-center gap-3 mb-3">
        <Text className="text-[15px] font-semibold italic text-foreground">
          {meaning.partOfSpeech}
        </Text>
        <View className="flex-1 h-px bg-border" />
      </View>

      {/* Definitions */}
      <View className="gap-3.5">
        {meaning.definitions.map((def, index) => (
          <View key={`${index}-${def.definition}`} className="flex-row gap-3">
            <Text className="text-[15px] text-muted-foreground w-5 text-right">
              {index + 1}.
            </Text>
            <View className="flex-1">
              <Text className="text-[17px] text-foreground leading-relaxed">
                {def.definition}
              </Text>
              {def.example && (
                <Text className="text-[15px] text-muted-foreground italic leading-relaxed mt-1">
                  “{def.example}”
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Synonyms */}
      {meaning.synonyms && meaning.synonyms.length > 0 && (
        <View className="flex-row flex-wrap items-baseline gap-x-2 mt-3.5 pl-8">
          <Text className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
            Synonyms
          </Text>
          <Text className="text-[15px] text-foreground flex-1">
            {meaning.synonyms.slice(0, 8).join(", ")}
          </Text>
        </View>
      )}
    </View>
  );
}
