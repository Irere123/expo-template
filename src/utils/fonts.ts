import type { TextStyle } from "react-native";

/**
 * Editorial type system.
 *
 * Large display type (the app title and headwords) is set in Figtree, a clean
 * geometric sans, while the remaining literary content (definitions, examples,
 * mid-size titles) stays in the Fraunces serif. UI chrome (buttons, labels,
 * chips, lists) uses the system sans. The fonts are loaded in `app/_layout.tsx`.
 *
 * These are applied via the `style` prop so they compose with the Tailwind
 * classes that set size / weight / colour, and degrade to the system font if
 * the serif ever fails to load. The family strings match the keys passed to
 * `useFonts`, which is how expo-font registers them on both platforms.
 */
export const fonts = {
  /** Large display headwords and the home title. */
  display: { fontFamily: "Figtree_700Bold" },
  /** Mid-size titles: word-of-the-day, drawer header, error headlines. */
  title: { fontFamily: "Fraunces_600SemiBold" },
  /** Reading body: definitions and the word-of-the-day gloss. */
  reading: { fontFamily: "Fraunces_400Regular" },
  /** Emphasis: example sentences and part-of-speech labels. */
  readingItalic: { fontFamily: "Fraunces_400Regular_Italic" },
} satisfies Record<string, TextStyle>;
