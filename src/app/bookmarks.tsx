import { useRouter } from "expo-router";
import { Bookmark, X } from "lucide-react-native";
import { Fragment } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { MainHeader } from "@/components/main-header";
import { useBookmarks } from "@/utils/bookmarks";

export default function BookmarksScreen() {
  const router = useRouter();
  const { bookmarks, removeBookmark, clearBookmarks } = useBookmarks();
  const insets = useSafeAreaInsets();

  const bottomPadding = (Platform.OS === "android" ? insets.bottom : 0) + 48;

  const openWord = (word: string) =>
    router.push({
      pathname: "/word/[word]",
      params: { word: word.trim().toLowerCase() },
    });

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: bottomPadding }}
      >
        {bookmarks.length > 0 ? (
          <View className="pt-4">
            <View className="flex-row items-center justify-between px-5 mb-1">
              <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Saved
              </Text>
              <Pressable
                onPress={clearBookmarks}
                accessibilityRole="button"
                hitSlop={8}
                className="active:opacity-60"
              >
                <Text className="text-sm font-medium text-foreground">
                  Clear
                </Text>
              </Pressable>
            </View>

            {bookmarks.map((word, index) => (
              <Fragment key={word}>
                <View className="flex-row items-center px-5 py-4 gap-3">
                  <Pressable
                    onPress={() => openWord(word)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${word}`}
                    className="flex-1 flex-row items-center gap-3 active:opacity-60"
                  >
                    <Icon
                      icon={Bookmark}
                      className="w-[18px] h-[18px] text-foreground"
                    />
                    <Text
                      numberOfLines={1}
                      className="flex-1 text-[17px] font-medium text-foreground capitalize"
                    >
                      {word}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => removeBookmark(word)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${word} from bookmarks`}
                    hitSlop={10}
                    className="p-1 -mr-1 active:opacity-50"
                  >
                    <Icon icon={X} className="w-[18px] h-[18px] text-muted-foreground" />
                  </Pressable>
                </View>
                {index < bookmarks.length - 1 && (
                  <View className="h-px bg-border mx-5" />
                )}
              </Fragment>
            ))}
          </View>
        ) : (
          <View className="items-center px-10 pt-20 gap-3">
            <View className="w-16 h-16 rounded-3xl bg-secondary items-center justify-center border-continuous">
              <Icon icon={Bookmark} className="w-7 h-7 text-muted-foreground" />
            </View>
            <Text className="text-[17px] font-semibold text-foreground text-center">
              No bookmarks yet
            </Text>
            <Text className="text-[15px] text-muted-foreground text-center leading-relaxed max-w-[280px]">
              Tap the bookmark icon on any word to save it here for later.
            </Text>
            <Pressable
              onPress={() => router.navigate("/")}
              accessibilityRole="button"
              className="mt-2 rounded-2xl bg-foreground px-5 h-[48px] items-center justify-center active:opacity-80 border-continuous"
            >
              <Text className="text-[15px] font-semibold text-background">
                Search words
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <MainHeader />
    </>
  );
}
