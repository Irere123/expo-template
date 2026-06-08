# Dictionary Mobile App — Design

Cross-platform (Android + iOS) dictionary app built with **React Native + Expo
Router**, consuming the **Free Dictionary API**. Styling uses Uniwind
(Tailwind classes), networking uses **axios**, and pronunciation playback uses
**expo-audio**.

## 1. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         UI / Screens                          │
│  Search (index)   Word detail (word/[word])   Drawer history  │
└───────────────┬───────────────────────────┬──────────────────┘
                │                            │
        useHistory() context        fetchWord() (axios)
                │                            │
┌───────────────▼─────────────┐  ┌──────────▼───────────────────┐
│   search-history (context)   │  │   dictionary-api (data layer)│
│  in-memory list, no dupes    │  │  axios + cache + typed errors│
└──────────────────────────────┘  └──────────┬───────────────────┘
                                              │ HTTPS GET
                                   ┌──────────▼───────────────────┐
                                   │   Free Dictionary API        │
                                   │   api.dictionaryapi.dev      │
                                   └──────────────────────────────┘
```

**Layers**

- **Data layer** — `src/utils/dictionary-api.ts`: the only place that touches
  the network. Validates input, calls the API with axios, caches successful
  lookups in memory, and maps every failure onto a typed `DictionaryError`
  (`empty | not-found | network | unknown`). Also derives helpers
  (`getPronunciations`, `getPhoneticText`).
- **State** — `src/utils/search-history.tsx`: a React context holding the list
  of searched words (most-recent-first, de-duplicated case-insensitively).
- **UI** — Expo Router file-based screens + reusable components.

## 2. Data flow

1. User types a word on the **Search** screen and submits.
2. Input is validated (non-empty); the app navigates to `/word/<word>`.
3. The **Word detail** screen calls `fetchWord(word)`:
   - shows a loading spinner while the request is in flight;
   - on success, parses the JSON, renders the details, and pushes the word to
     search history;
   - on failure, renders a typed error state (not-found / offline / generic)
     with a retry action.
4. Searched words appear in the **drawer** and the **Recent searches** list;
   tapping one re-runs the same flow (served instantly from cache when present).

## 3. API endpoint

| Method | URL                                                          | Notes                          |
| ------ | ------------------------------------------------------------ | ------------------------------ |
| GET    | `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`     | Returns an array of entries.   |

- **200** → `[{ word, phonetic, phonetics[], meanings[] }]`
- **404** → `{ title: "No Definitions Found", ... }` → mapped to `not-found`
- No response (timeout/offline) → mapped to `network`

Audio pronunciation URLs come from each entry's `phonetics[].audio` field.

## 4. Pages / routes

| Route               | File                          | Purpose                                                        |
| ------------------- | ----------------------------- | ------------------------------------------------------------- |
| `/` (Search)        | `src/app/index.tsx`           | Search input + button, validation, recent searches.           |
| `/word/[word]`      | `src/app/word/[word].tsx`     | Loading / error / details (phonetics, meanings, audio).       |
| Drawer              | `src/components/drawer-content.tsx` | Navigation + tappable search history.                   |
| `/(settings)/*`     | `src/app/(settings)/`         | Template settings/profile (retained).                         |

## 5. Activity coverage

- **Word search & API integration** — `index.tsx` (input + validation),
  `dictionary-api.ts` (axios GET, dynamic URL, loading, parse, cache).
- **Display word details** — `word/[word].tsx` (`WordDetails`, `MeaningBlock`):
  headword, phonetics, part of speech, numbered definitions, examples,
  synonyms; supports multiple meanings and long definitions.
- **Audio pronunciation** — `audio-button.tsx`: speaker icon, multiple accents,
  play/pause/reset, hidden when no audio, graceful playback-failure handling.
- **Drawer navigation & history** — `search-history.tsx` + `drawer-content.tsx`:
  de-duplicated history, tap to re-search, clear history.
- **Error handling & feedback** — typed `DictionaryError`, 404 "Word not found",
  network errors, retry, empty states, malformed-response guards.
