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

export type DictionaryErrorKind =
  | "empty"
  | "invalid"
  | "not-found"
  | "network"
  | "unknown";

/** A single error type carrying a user-facing message and a machine `kind`. */
export class DictionaryError extends Error {
  readonly kind: DictionaryErrorKind;

  constructor(kind: DictionaryErrorKind, message: string) {
    super(message);
    this.name = "DictionaryError";
    this.kind = kind;
  }
}

/* ─── Input validation ─── */

export type WordValidation =
  | { ok: true; word: string }
  | { ok: false; kind: "empty" | "invalid"; message: string };

// Longest word in major English dictionaries is 45 letters; allow a little
// headroom and reject anything beyond as not a real lookup.
const MAX_WORD_LENGTH = 60;

// A single token of Latin letters (incl. common accented ranges for loanwords
// like "naïve" / "café"), optionally joined by internal hyphens or apostrophes
// ("self-aware", "o'clock"). No leading/trailing separators, digits or symbols.
const WORD_PATTERN =
  /^[A-Za-zÀ-ɏ]+(?:['’‐‑-][A-Za-zÀ-ɏ]+)*$/;

/**
 * Validate and normalise a user-entered search term. Returns the cleaned,
 * lower-cased word on success, or a typed failure with a user-facing message.
 * Centralised so the search box and the data layer enforce the same rules.
 */
export function validateWord(raw: string): WordValidation {
  const input = (raw ?? "").normalize("NFC").trim().replace(/\s+/g, " ");

  if (!input) {
    return { ok: false, kind: "empty", message: "Please enter a word to search." };
  }
  if (/\s/.test(input)) {
    return {
      ok: false,
      kind: "invalid",
      message: "Enter a single word, without spaces.",
    };
  }
  if (input.length > MAX_WORD_LENGTH) {
    return {
      ok: false,
      kind: "invalid",
      message: "That's a bit long for a single word.",
    };
  }
  if (/\d/.test(input)) {
    return {
      ok: false,
      kind: "invalid",
      message: "Words don't contain numbers.",
    };
  }
  if (!WORD_PATTERN.test(input)) {
    return {
      ok: false,
      kind: "invalid",
      message: "Use letters only — no symbols.",
    };
  }

  return { ok: true, word: input.toLowerCase() };
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
  // Validate and normalise up front so we never hit the network with a bad
  // query (empty, multi-word, numeric, symbols, absurd length).
  const validation = validateWord(rawWord);
  if (!validation.ok) {
    throw new DictionaryError(validation.kind, validation.message);
  }
  const word = validation.word;

  const key = word;
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

/* ─── "Did you mean?" suggestions ─── */

// The Free Dictionary API does not return spelling suggestions on a 404, so we
// derive them on-device by edit-distance against a list of common words (plus
// whatever the user has already looked up). This keeps the "word not found"
// screen helpful instead of being a dead end.
const COMMON_WORDS = [
  "serendipity", "ephemeral", "eloquent", "mellifluous", "petrichor",
  "quixotic", "quixote", "luminous", "ineffable", "halcyon", "ethereal",
  "solace", "nostalgia", "resilience", "ambiguous", "benevolent", "candid",
  "diligent", "empathy", "fortuitous", "gregarious", "humble", "intricate",
  "jubilant", "kindle", "lucid", "meticulous", "nuance", "oblivion",
  "paradox", "quaint", "resonate", "serene", "tenacious", "ubiquitous",
  "vivid", "whimsical", "zealous", "abundant", "acumen", "aesthetic",
  "altruism", "anomaly", "articulate", "authentic", "brevity", "cadence",
  "catalyst", "cogent", "compelling", "concise", "convey", "curious",
  "deliberate", "delicate", "demure", "depict", "dexterity", "dichotomy",
  "earnest", "eclectic", "elaborate", "elated", "eloquence", "elusive",
  "enigma", "epiphany", "equanimity", "esoteric", "euphoria", "evocative",
  "exquisite", "fervent", "fleeting", "fragile", "garrulous", "genuine",
  "graceful", "gratitude", "harmony", "idyllic", "illuminate", "imminent",
  "immutable", "incandescent", "ineffective", "innate", "innovate", "insight",
  "inspire", "integrity", "intrepid", "intuitive", "jovial", "languid",
  "lethargic", "liberty", "limpid", "magnanimous", "marvel", "melancholy",
  "memento", "mercurial", "mirth", "myriad", "nebulous", "nimble", "novel",
  "obscure", "opulent", "ornate", "panacea", "paramount", "pensive",
  "perennial", "perplex", "pertinent", "phenomenon", "placid", "poignant",
  "pragmatic", "precious", "profound", "prolific", "prudent", "quintessential",
  "radiant", "rapture", "reciprocal", "redolent", "reflect", "rejuvenate",
  "relish", "reminisce", "reverie", "sagacious", "sanguine", "scintillating",
  "sentiment", "solitude", "sublime", "succinct", "surreal", "sycophant",
  "tangible", "tenuous", "tranquil", "translucent", "tremendous", "vibrant",
  "vigilant", "vindicate", "wander", "wanderlust", "winsome", "wistful",
  "wonder", "zenith", "zephyr", "definition", "dictionary", "language",
  "synonym", "antonym", "pronounce", "vocabulary",
];

/** Levenshtein edit distance (capped early for performance). */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 99;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * Suggest near-matches for a misspelled query. `pool` lets the caller fold in
 * extra candidates (e.g. the user's search history). Returns up to 3 words,
 * closest first, or an empty array when nothing is close enough.
 */
export function suggestWords(query: string, pool: string[] = []): string[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  // Short words tolerate fewer edits so we don't suggest unrelated words.
  const threshold = q.length <= 4 ? 1 : 2;

  const seen = new Set<string>();
  const scored: { word: string; dist: number }[] = [];
  for (const candidate of [...pool, ...COMMON_WORDS]) {
    const w = candidate.trim().toLowerCase();
    if (!w || w === q || seen.has(w)) continue;
    seen.add(w);
    const dist = editDistance(q, w);
    if (dist > 0 && dist <= threshold) scored.push({ word: w, dist });
  }

  scored.sort((a, b) => a.dist - b.dist || a.word.localeCompare(b.word));
  return scored.slice(0, 3).map((s) => s.word);
}

/* ─── Word of the day ─── */

export type WordOfTheDay = {
  word: string;
  partOfSpeech: string;
  gloss: string;
};

// A small curated rotation of words that all resolve on the API, so tapping the
// card always leads to a real entry.
const WORDS_OF_THE_DAY: WordOfTheDay[] = [
  { word: "petrichor", partOfSpeech: "noun", gloss: "A pleasant, earthy smell produced when rain falls on dry soil." },
  { word: "serendipity", partOfSpeech: "noun", gloss: "The occurrence of events by chance in a happy or beneficial way." },
  { word: "ephemeral", partOfSpeech: "adjective", gloss: "Lasting for a very short time; fleeting." },
  { word: "mellifluous", partOfSpeech: "adjective", gloss: "Sweet or musical; pleasant to hear." },
  { word: "eloquent", partOfSpeech: "adjective", gloss: "Fluent or persuasive in speaking or writing." },
  { word: "quixotic", partOfSpeech: "adjective", gloss: "Extremely idealistic; unrealistic and impractical." },
  { word: "luminous", partOfSpeech: "adjective", gloss: "Full of or shedding light; radiant." },
  { word: "ineffable", partOfSpeech: "adjective", gloss: "Too great or extreme to be expressed in words." },
  { word: "halcyon", partOfSpeech: "adjective", gloss: "Denoting a period that is idyllically happy and peaceful." },
  { word: "ethereal", partOfSpeech: "adjective", gloss: "Extremely delicate and light, seemingly not of this world." },
  { word: "solace", partOfSpeech: "noun", gloss: "Comfort or consolation in a time of distress." },
  { word: "nostalgia", partOfSpeech: "noun", gloss: "A sentimental longing for the past." },
];

/** Deterministic word of the day, rotating once per calendar day. */
export function getWordOfTheDay(date: Date = new Date()): WordOfTheDay {
  const dayOfYear = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
      86_400_000,
  );
  return WORDS_OF_THE_DAY[dayOfYear % WORDS_OF_THE_DAY.length];
}

/* ─── Explore ─── */

// A hand-picked set of evocative words for the home screen's "Explore" row —
// all resolve on the API, so tapping any chip lands on a real entry.
export const EXPLORE_WORDS = [
  "serendipity",
  "ephemeral",
  "petrichor",
  "mellifluous",
  "eloquent",
  "quixotic",
  "ineffable",
  "epiphany",
  "luminous",
  "aurora",
  "nostalgia",
  "labyrinth",
];
