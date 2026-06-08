import React, {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from "react";

/**
 * App-wide search history. Successfully searched words are pushed here so they
 * appear in the drawer and on the search screen. Duplicates are collapsed
 * (case-insensitive) and the most recent search is kept at the front.
 */

type HistoryContextValue = {
  history: string[];
  addWord: (word: string) => void;
  removeWord: (word: string) => void;
  clearHistory: () => void;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

const MAX_HISTORY = 50;

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<string[]>([]);

  const addWord = useCallback((raw: string) => {
    const word = raw.trim();
    if (!word) return;
    setHistory((prev) => {
      // Prevent duplicate entries; move the word back to the front instead.
      const withoutDupes = prev.filter(
        (w) => w.toLowerCase() !== word.toLowerCase(),
      );
      return [word, ...withoutDupes].slice(0, MAX_HISTORY);
    });
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
