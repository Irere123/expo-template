import { Icon } from "@/components/icon";
import { Stack, useRouter } from "expo-router";
import { Menu, SquarePen } from "lucide-react-native";
import { Pressable } from "react-native";
import { useDrawer } from "./drawer-content";

/**
 * Header for the Home screen: a drawer toggle on the left and a primary
 * action on the right. The screen title comes from the Stack screen options
 * in app/_layout.tsx.
 */
export function MainHeader() {
  const { openDrawer } = useDrawer();
  const router = useRouter();
  const goToItems = () => router.navigate("/items");

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
        headerRight: () => (
          <Pressable
            onPress={goToItems}
            accessibilityLabel="New"
            accessibilityRole="button"
            className="p-2 -mr-1 active:opacity-60"
          >
            <Icon icon={SquarePen} className="w-6 h-6 text-foreground" />
          </Pressable>
        ),
      }}
    />
  );
}
