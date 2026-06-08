import {
  DrawerContent,
  DrawerProvider,
  useDrawer,
} from "@/components/drawer-content";
import { DrawerLayout } from "@/components/drawer-layout";
import "@/global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as RNTheme,
} from "@react-navigation/native";
import { setAudioModeAsync } from "expo-audio";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind, useCSSVariable } from "uniwind";

import { HistoryProvider } from "@/utils/search-history";
import { useSystemBackgroundColor } from "@/utils/use-system-background-color";

const GLASS = isLiquidGlassAvailable();
const IS_ANDROID = process.env.EXPO_OS === "android";

function ThemeProvider(props: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  return (
    <RNTheme value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
        {props.children}
      </SafeAreaListener>
    </RNTheme>
  );
}

export const unstable_settings = {
  anchor: "index",
};

export default function RootLayout() {
  // Allow pronunciations to play even when the device is on silent mode.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <KeyboardProvider>
        <HistoryProvider>
          <DrawerProvider>
            <RootDrawer />
          </DrawerProvider>
        </HistoryProvider>
        {process.env.EXPO_OS !== "ios" && <StatusBar style="auto" />}
      </KeyboardProvider>
    </ThemeProvider>
  );
}

function RootDrawer() {
  const router = useRouter();
  const { isOpen, openDrawer, closeDrawer } = useDrawer();

  useSystemBackgroundColor();

  return (
    <DrawerLayout
      open={isOpen}
      onOpen={openDrawer}
      onClose={closeDrawer}
      drawerContent={
        <DrawerContent
          onNavigate={(path) => {
            closeDrawer();
            router.replace(path, { withAnchor: true });
          }}
        />
      }
    >
      <StackLayout />
    </DrawerLayout>
  );
}

function StackLayout() {
  const appForeground = useCSSVariable("--app-foreground") as string;
  const appBackground = useCSSVariable("--app-background") as string;

  return (
    <Stack
      screenOptions={{
        headerTransparent: GLASS,
        headerBackButtonDisplayMode: GLASS ? "minimal" : "default",
        headerTintColor: appForeground,
        headerShadowVisible: IS_ANDROID ? false : undefined,
        headerStyle: IS_ANDROID
          ? {
              backgroundColor: appBackground,
            }
          : undefined,
      }}
    >
      <Stack.Screen
        name="index"
        dangerouslySingular
        options={{
          // The on-screen hero already says "Dictionary"; keep the bar empty
          // so only the drawer (menu) button shows. Use an empty string (not a
          // headerTitle component) so the native header renders normally.
          title: "",
          animation: "none",
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="word/[word]"
        options={{
          // The headword is shown large in the screen body, so the header
          // carries only the back button — no duplicated title. An empty
          // string title keeps the native back button; a headerTitle function
          // returning null can suppress it on iOS.
          title: "",
          headerBackTitle: "",
          headerLargeTitleShadowVisible: false,
        }}
      />
    </Stack>
  );
}
