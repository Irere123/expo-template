# Dictionary App — Documentation

A native dictionary app built with **Expo** / **React Native** and **expo-router**. It
looks up words against the [Free Dictionary API](https://dictionaryapi.dev/), shows
meanings, pronunciations, synonyms and examples, and keeps a persisted history of
everything the user has searched.

## Contents

| Doc | What's inside |
| --- | --- |
| [architecture.md](./architecture.md) | System architecture diagram, layer breakdown, tech stack |
| [data-flow.md](./data-flow.md) | Data-flow & sequence diagrams (search, caching, history, audio) |
| [design.md](./design.md) | Navigation map, screen states, component tree |
| [api-endpoints.md](./api-endpoints.md) | Current external endpoint + backend endpoints **to be developed** |
| [pages.md](./pages.md) | Current screens + screens/pages **to be developed** |

## Quick facts

- **Routing:** file-based via `expo-router` (`src/app/`)
- **Data source:** `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` (no own backend yet)
- **Networking:** `axios`, 10s timeout, typed `DictionaryError`
- **Caching:** in-memory `Map` keyed by lowercased word (`src/utils/dictionary-api.ts`)
- **Persistence:** search history in `AsyncStorage` (`src/utils/search-history.tsx`)
- **Audio:** `expo-audio` plays pronunciation clips, even on silent mode
- **Styling:** `uniwind` + Tailwind v4, Fraunces serif via `@expo-google-fonts/fraunces`

## Current source map

```
src/
├─ app/
│  ├─ _layout.tsx          Root: providers, theme, stack + drawer
│  ├─ index.tsx            Search / home screen
│  └─ word/[word].tsx      Word detail screen (loading / success / error)
├─ components/
│  ├─ drawer-content.tsx   Side drawer (nav + history)
│  ├─ drawer-layout.tsx    Drawer container
│  ├─ audio-button.tsx     Pronunciation playback pill
│  ├─ main-header.*        Platform-specific headers
│  └─ icon.tsx, tw.tsx …   UI primitives
└─ utils/
   ├─ dictionary-api.ts    Data layer: fetch, cache, suggestions, word-of-day
   ├─ search-history.tsx   History context + AsyncStorage persistence
   └─ fonts.ts             Font tokens
```

> **Legend used across these docs:** items marked _Current_ exist in the codebase
> today; items marked **To be developed** are proposed for the roadmap.
