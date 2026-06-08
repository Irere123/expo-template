import { Icon } from "@/components/icon";
import * as Application from "expo-application";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack, useRouter } from "expo-router";
import { Info, X } from "lucide-react-native";
import { Alert, Pressable } from "react-native";
import { useCSSVariable } from "uniwind";

const GLASS = isLiquidGlassAvailable();

export default function SettingsLayout() {
  const router = useRouter();

  const appForeground = useCSSVariable("--app-foreground") as string;
  const appBackground = useCSSVariable("--app-background") as string;

  const showAppInfo = () => {
    const name = Application.applicationName ?? "expo-template";
    const version = Application.nativeApplicationVersion ?? "1.0.0";
    const build = Application.nativeBuildVersion ?? "dev";

    Alert.alert(name, `Version ${version} (${build})`, [
      { text: "Terms of Service" },
      { text: "Privacy Policy" },
      { text: "Help & Support" },
      { text: "OK", style: "cancel" },
    ]);
  };

  return (
    <Stack
      screenOptions={{
        headerTransparent: GLASS,
        headerLargeTitleShadowVisible: false,
        headerBackButtonDisplayMode: GLASS ? "minimal" : "default",
        headerTintColor: appForeground,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: appBackground,
        },
      }}
    >
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              accessibilityLabel="Close settings"
              accessibilityRole="button"
              className="p-2 -ml-1 active:opacity-60"
            >
              <Icon icon={X} className="h-6 w-6 text-foreground" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={showAppInfo}
              accessibilityLabel="Show app information"
              accessibilityRole="button"
              className="p-2 -mr-1 active:opacity-60"
            >
              <Icon icon={Info} className="h-6 w-6 text-foreground" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Stack>
  );
}
