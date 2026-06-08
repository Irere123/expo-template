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

/**
 * App-wide search history. Successfully searched words are pushed here so they
 * appear in the drawer and on the search screen. Duplicates are collapsed
 * (case-insensitive) and the most recent search is kept at the front.
 *
 * The list is persisted to AsyncStorage so it survives app restarts: it is
 * loaded once on mount and written back whenever it changes.
 */

type HistoryContextValue = {
  history: string[];
  addWord: (word: string) => void;
  removeWord: (word: string) => void;
  clearHistory: () => void;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

const STORAGE_KEY = "dictionary:search-history";
const MAX_HISTORY = 50;

/** Collapse case-insensitive duplicates (keeping first occurrence) and cap. */
function mergeUnique(...lists: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    for (const raw of list) {
      const word = raw.trim();
      if (!word) continue;
      const key = word.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(word);
    }
  }
  return out.slice(0, MAX_HISTORY);
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<string[]>([]);
  // Guards persistence so we don't overwrite stored data with the empty
  // initial state before the first load completes.
  const hydrated = useRef(false);

  // Load persisted history once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let stored: string[] = [];
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            stored = parsed.filter(
              (word): word is string => typeof word === "string",
            );
          }
        }
      } catch {
        // Corrupt or unavailable storage — start empty rather than crash.
      }
      if (cancelled) return;
      hydrated.current = true;
      if (stored.length > 0) {
        // Keep any words added during hydration in front of the stored ones.
        setHistory((prev) => mergeUnique(prev, stored));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist whenever the history changes (after the initial load).
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history)).catch(() => {});
  }, [history]);

  const addWord = useCallback((raw: string) => {
    const word = raw.trim();
    if (!word) return;
    // Prevent duplicate entries; move the word back to the front instead.
    setHistory((prev) => mergeUnique([word], prev));
  }, []);

  const removeWord = useCallback((word: string) => {
    setHistory((prev) =>
      prev.filter((w) => w.toLowerCase() !== word.toLowerCase()),
    );
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const value = useMemo(
    () => ({ history, addWord, removeWord, clearHistory }),
    [history, addWord, removeWord, clearHistory],
  );

  return <HistoryContext value={value}>{children}</HistoryContext>;
}

export function useHistory() {
  const context = use(HistoryContext);
  if (!context) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}
