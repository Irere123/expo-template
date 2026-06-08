import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Uniwind } from "uniwind";

/**
 * App appearance preference.
 *
 * "system" follows the OS; "light" / "dark" force a theme. The choice is applied
 * through `Uniwind.setTheme`, which also drives React Navigation's theme and the
 * native background colour (both read the scheme via Appearance), and it is
 * persisted to AsyncStorage so it survives restarts.
 */
export type ThemePreference = "system" | "light" | "dark";

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "dictionary:theme";

function isPreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function ThemePreferenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  // Guards the loader from overwriting a choice the user made before hydration.
  const hydrated = useRef(false);

  // Load and apply the saved preference once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let stored: ThemePreference = "system";
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (isPreference(raw)) stored = raw;
      } catch {
        // Unavailable storage — fall back to following the system.
      }
      if (cancelled || hydrated.current) return;
      hydrated.current = true;
      Uniwind.setTheme(stored);
      setPreferenceState(stored);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    hydrated.current = true;
    setPreferenceState(next);
    Uniwind.setTheme(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ preference, setPreference }),
    [preference, setPreference],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useThemePreference() {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error(
      "useThemePreference must be used within a ThemePreferenceProvider",
    );
  }
  return context;
}
