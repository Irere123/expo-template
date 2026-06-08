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
 * Saved / favourite words. Bookmarks are kept most-recent-first, de-duplicated
 * case-insensitively, and persisted to AsyncStorage so they're available across
 * restarts. Mirrors the search-history store but is curated by the user rather
 * than filled automatically.
 */

type BookmarksContextValue = {
  bookmarks: string[];
  isBookmarked: (word: string) => boolean;
  toggleBookmark: (word: string) => void;
  removeBookmark: (word: string) => void;
  clearBookmarks: () => void;
};

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

const STORAGE_KEY = "dictionary:bookmarks";
const MAX_BOOKMARKS = 200;

const sameWord = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

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
  return out.slice(0, MAX_BOOKMARKS);
}

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  // Guards persistence so the empty initial state can't overwrite stored data
  // before the first load completes.
  const hydrated = useRef(false);

  // Load persisted bookmarks once on mount.
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
        setBookmarks((prev) => mergeUnique(prev, stored));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist whenever bookmarks change (after the initial load).
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks)).catch(() => {});
  }, [bookmarks]);

  const isBookmarked = useCallback(
    (word: string) => bookmarks.some((b) => sameWord(b, word)),
    [bookmarks],
  );

  const toggleBookmark = useCallback((raw: string) => {
    const word = raw.trim();
    if (!word) return;
    setBookmarks((prev) =>
      prev.some((b) => sameWord(b, word))
        ? prev.filter((b) => !sameWord(b, word))
        : mergeUnique([word], prev),
    );
  }, []);

  const removeBookmark = useCallback((word: string) => {
    setBookmarks((prev) => prev.filter((b) => !sameWord(b, word)));
  }, []);

  const clearBookmarks = useCallback(() => setBookmarks([]), []);

  const value = useMemo(
    () => ({
      bookmarks,
      isBookmarked,
      toggleBookmark,
      removeBookmark,
      clearBookmarks,
    }),
    [bookmarks, isBookmarked, toggleBookmark, removeBookmark, clearBookmarks],
  );

  return (
    <BookmarksContext value={value}>{children}</BookmarksContext>
  );
}

export function useBookmarks() {
  const context = use(BookmarksContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarksProvider");
  }
  return context;
}
