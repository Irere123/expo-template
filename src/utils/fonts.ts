import type { TextStyle } from "react-native";

/**
 * Editorial type system.
 *
 * Literary content (the app title, headwords, definitions, examples) is set in
 * the bundled Fraunces serif — loaded in `app/_layout.tsx` — while UI chrome
 * (buttons, labels, chips, lists) stays on the crisp system sans. The pairing
 * gives the app a designed, dictionary-like feel instead of a flat default.
 *
 * These are applied via the `style` prop so they compose with the Tailwind
 * classes that set size / weight / colour, and degrade to the system font if
 * the serif ever fails to load. The family strings match the keys passed to
 * `useFonts`, which is how expo-font registers them on both platforms.
 */
export const fonts = {
  /** Large display headwords and the home title. */
  display: { fontFamily: "Fraunces_700Bold" },
  /** Mid-size titles: word-of-the-day, drawer header, error headlines. */
  title: { fontFamily: "Fraunces_600SemiBold" },
  /** Reading body: definitions and the word-of-the-day gloss. */
  reading: { fontFamily: "Fraunces_400Regular" },
  /** Emphasis: example sentences and part-of-speech labels. */
  readingItalic: { fontFamily: "Fraunces_400Regular_Italic" },
} satisfies Record<string, TextStyle>;
