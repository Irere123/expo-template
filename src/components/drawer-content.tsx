import "@/global.css";

import { Icon } from "@/components/icon";
import { SafeAreaView } from "@/components/tw";
import { fonts } from "@/utils/fonts";
import { useHistory } from "@/utils/search-history";
import { cn } from "@/utils/tailwind";
import type { Href } from "expo-router";
import { usePathname } from "expo-router";

import { Bookmark, BookOpen, Clock, Search, X } from "lucide-react-native";
import React, { createContext, use, useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type DrawerContextValue = {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  return (
    <DrawerContext value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext>
  );
}

export function useDrawer() {
  const context = use(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
}

/** Pull the currently-open word out of the route, e.g. "/word/serendipity". */
function activeWordFromPath(pathname: string): string | null {
  const match = /^\/word\/(.+)$/.exec(pathname);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]).toLowerCase();
  } catch {
    return match[1].toLowerCase();
  }
}

function DrawerNavItem({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: typeof Search;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3 mx-2 rounded-[10px] active:bg-muted"
    >
      <Icon icon={icon} className="w-[22px] h-[22px] text-foreground" />
      <Text className="text-base font-medium text-foreground">{label}</Text>
    </Pressable>
  );
}

function DrawerHistoryItem({
  title,
  onPress,
  onRemove,
  active,
}: {
  title: string;
  onPress: () => void;
  onRemove: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-3 pl-3 pr-1.5 py-3 mx-3 active:opacity-70",
        active && "bg-secondary rounded-xl border-continuous",
      )}
    >
      <Icon
        icon={Clock}
        className={cn(
          "w-[18px] h-[18px]",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      />
      <Text
        numberOfLines={1}
        className={cn(
          "flex-1 text-base capitalize",
          active ? "font-semibold text-foreground" : "text-foreground",
        )}
      >
        {title}
      </Text>
      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${title} from history`}
        hitSlop={8}
        className="p-1.5 active:opacity-50"
      >
        <Icon icon={X} className="w-4 h-4 text-muted-foreground" />
      </Pressable>
    </Pressable>
  );
}

export function DrawerContent({
  onNavigate,
}: {
  onNavigate: (path: Href) => void;
}) {
  const { history, clearHistory, removeWord } = useHistory();
  const activeWord = activeWordFromPath(usePathname());

  return (
    <SafeAreaView
      // NOTE: Some issue with uniwind that prevents updates for this component.
      className="flex-1"
      edges={["top", "bottom", "left"]}
    >
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 pt-2 pb-3">
        <View className="w-11 h-11 rounded-2xl bg-primary items-center justify-center border-continuous">
          <Icon icon={BookOpen} className="w-5 h-5 text-primary-foreground" />
        </View>
        <Text
          style={fonts.title}
          className="text-[26px] font-bold tracking-tight text-foreground"
        >
          Dictionary
        </Text>
      </View>

      {/* Nav + search history */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 8 }}>
        <DrawerNavItem label="Search" icon={Search} onPress={() => onNavigate("/")} />
        <DrawerNavItem
          label="Bookmarks"
          icon={Bookmark}
          onPress={() => onNavigate("/bookmarks")}
        />

        {/* Search history */}
        <View className="flex-row items-center justify-between px-6 pt-6 pb-2">
          <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            History
          </Text>
          {history.length > 0 && (
            <Pressable
              onPress={clearHistory}
              hitSlop={8}
              className="active:opacity-60"
            >
              <Text className="text-sm font-medium text-foreground">Clear</Text>
            </Pressable>
          )}
        </View>

        {history.length === 0 ? (
          <Text className="text-[15px] text-muted-foreground px-6 pt-1">
            No searches yet.
          </Text>
        ) : (
          history.map((word) => (
            <DrawerHistoryItem
              key={word}
              title={word}
              active={activeWord === word.toLowerCase()}
              onPress={() =>
                onNavigate({
                  pathname: "/word/[word]",
                  params: { word: word.toLowerCase() },
                })
              }
              onRemove={() => removeWord(word)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
