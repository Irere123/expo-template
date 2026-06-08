import { Menu01Icon } from "@hugeicons/core-free-icons";
import { Stack } from "expo-router";
import { Pressable } from "react-native";

import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDrawer } from "./drawer-content";

/**
 * Header for the Search (home) screen: a drawer (menu) toggle on the left and
 * the light/dark theme toggle on the right. The bar carries no title — the hero
 * in the screen body already reads "Dictionary".
 */
export function MainHeader() {
  const { openDrawer } = useDrawer();

  return (
    <Stack.Screen
      options={{
        headerLeft: () => (
          <Pressable
            onPress={openDrawer}
            accessibilityLabel="Open drawer"
            accessibilityRole="button"
            className="p-2 -ml-1 active:opacity-60"
          >
            <Icon icon={Menu01Icon} className="w-6 h-6 text-foreground" />
          </Pressable>
        ),
        headerRight: () => <ThemeToggle />,
      }}
    />
  );
}
