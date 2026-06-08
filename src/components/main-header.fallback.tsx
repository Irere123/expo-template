import { Stack } from "expo-router";
import { Menu } from "lucide-react-native";
import { Pressable } from "react-native";

import { Icon } from "@/components/icon";
import { useDrawer } from "./drawer-content";

/**
 * Header for the Search (home) screen: just a drawer (menu) toggle on the left.
 * The bar carries no title — the hero in the screen body already reads
 * "Dictionary".
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
            <Icon icon={Menu} className="w-6 h-6 text-foreground" />
          </Pressable>
        ),
      }}
    />
  );
}
