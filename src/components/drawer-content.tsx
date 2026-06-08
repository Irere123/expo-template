import "@/global.css";

import { SafeAreaView } from "@/components/tw";
import { useHistory } from "@/utils/search-history";
import { cn } from "@/utils/tailwind";
import type { Href } from "expo-router";

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

function DrawerNavItem({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="px-4 py-3 mx-2 rounded-[10px] active:bg-muted"
    >
      <Text className="text-base text-foreground">
        {label}
      </Text>
    </Pressable>
  );
}

function DrawerRecentItem({
  title,
  onPress,
  active,
}: {
  title: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        `px-4 py-2.5 mx-2 rounded-[10px] active:bg-accent`,
        active && "bg-muted",
      )}
    >
      <Text
        numberOfLines={1}
        className={cn(
          `text-[15px] capitalize`,
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function DrawerContent({
  onNavigate,
}: {
  onNavigate: (path: Href) => void;
}) {
  const { history, clearHistory } = useHistory();

  return (
    <SafeAreaView
      // NOTE: Some issue with uniwind that prevents updates for this component.
      className="flex-1"
      edges={["top", "bottom", "left"]}
    >
      {/* Header */}
      <View className="px-4 pt-2 pb-3">
        <Text className="text-[28px] font-bold text-foreground">
          Dictionary
        </Text>
      </View>

      {/* Nav + search history */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        <DrawerNavItem label="Search" onPress={() => onNavigate("/")} />

        {/* Search history */}
        <View className="flex-row items-center justify-between px-6 pt-5 pb-1.5">
          <Text className="text-[13px] font-semibold text-muted-foreground">
            History
          </Text>
          {history.length > 0 && (
            <Pressable onPress={clearHistory} className="active:opacity-60">
              <Text className="text-[13px] text-muted-foreground">Clear</Text>
            </Pressable>
          )}
        </View>

        {history.length === 0 ? (
          <Text className="text-[15px] text-muted-foreground px-6 pt-1">
            No searches yet.
          </Text>
        ) : (
          history.map((word) => (
            <DrawerRecentItem
              key={word}
              title={word}
              onPress={() =>
                onNavigate({
                  pathname: "/word/[word]",
                  params: { word: word.toLowerCase() },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
