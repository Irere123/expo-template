import axios, { isAxiosError } from "axios";

/**
 * Data layer for the Free Dictionary API.
 *
 *   GET https://api.dictionaryapi.dev/api/v2/entries/en/{word}
 *
 * All network access goes through `fetchWord`, which normalises the response,
 * caches successful lookups, and maps every failure mode onto a typed
 * `DictionaryError` so the UI can show a relevant message.
 */

const BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";
const REQUEST_TIMEOUT = 10_000;

/* ─── Response shapes ─── */

export type Phonetic = {
  text?: string;
  audio?: string;
  sourceUrl?: string;
};

export type Definition = {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
};

export type Meaning = {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
};

export type WordEntry = {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  sourceUrls?: string[];
};

/* ─── Errors ─── */

export type DictionaryErrorKind = "empty" | "not-found" | "network" | "unknown";

/** A single error type carrying a user-facing message and a machine `kind`. */
export class DictionaryError extends Error {
  readonly kind: DictionaryErrorKind;

  constructor(kind: DictionaryErrorKind, message: string) {
    super(message);
    this.name = "DictionaryError";
    this.kind = kind;
  }
}

/* ─── In-memory cache ─── */

// Temporarily stores fetched word data so re-opening a word (e.g. from the
// search history drawer) is instant and avoids a redundant request.
const cache = new Map<string, WordEntry[]>();

export function getCachedWord(word: string): WordEntry[] | undefined {
  return cache.get(word.trim().toLowerCase());
}

/* ─── Fetching ─── */

export async function fetchWord(rawWord: string): Promise<WordEntry[]> {
  const word = rawWord.trim();

  // Input validation: never hit the network with an empty query.
  if (!word) {
    throw new DictionaryError("empty", "Please enter a word to search.");
  }

  const key = word.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const { data } = await axios.get<WordEntry[]>(
      `${BASE_URL}/${encodeURIComponent(word)}`,
      { timeout: REQUEST_TIMEOUT },
    );

    // Guard against malformed / empty payloads so the UI never crashes.
    if (!Array.isArray(data) || data.length === 0) {
      throw new DictionaryError(
        "not-found",
        `No definitions found for "${word}".`,
      );
    }

    cache.set(key, data);
    return data;
  } catch (err) {
    if (err instanceof DictionaryError) throw err;

    if (isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 404) {
        throw new DictionaryError(
          "not-found",
          `No definitions found for "${word}".`,
        );
      }
      if (err.response) {
        throw new DictionaryError(
          "unknown",
          `The dictionary service returned an error (${status}). Please try again.`,
        );
      }
      // No response at all → timeout / offline / DNS failure.
      throw new DictionaryError(
        "network",
        "Network error. Check your internet connection and try again.",
      );
    }

    throw new DictionaryError(
      "unknown",
      "Something went wrong. Please try again.",
    );
  }
}

/* ─── Derived helpers ─── */

export type Pronunciation = {
  url: string;
  /** Short accent label derived from the audio file name (US / UK / AU…). */
  label: string;
  text?: string;
};

/** Collect every distinct audio pronunciation across all entries. */
export function getPronunciations(entries: WordEntry[]): Pronunciation[] {
  const seen = new Set<string>();
  const out: Pronunciation[] = [];

  for (const entry of entries) {
    for (const phonetic of entry.phonetics ?? []) {
      const url = phonetic.audio?.trim();
      if (url && !seen.has(url)) {
        seen.add(url);
        out.push({ url, label: accentLabel(url), text: phonetic.text });
      }
    }
  }

  return out;
}

function accentLabel(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("-us.")) return "US";
  if (lower.includes("-uk.")) return "UK";
  if (lower.includes("-au.")) return "AU";
  return "Play";
}

/** The first available phonetic spelling across all entries. */
export function getPhoneticText(entries: WordEntry[]): string | undefined {
  for (const entry of entries) {
    if (entry.phonetic?.trim()) return entry.phonetic.trim();
  }
  for (const entry of entries) {
    for (const phonetic of entry.phonetics ?? []) {
      if (phonetic.text?.trim()) return phonetic.text.trim();
    }
  }
  return undefined;
}
