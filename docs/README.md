# Dictionary App — Docs

Native dictionary app built with **Expo / React Native + expo-router**. Looks up
words against the Free Dictionary API, plays pronunciations, and keeps a persisted
search history.

## Docs

| File | Contents |
| --- | --- |
| [architecture.md](./architecture.md) | System architecture + tech stack |
| [data-flow.md](./data-flow.md) | Lookup, caching, history, data shapes |
| [design.md](./design.md) | Navigation + components |
| [api-endpoints.md](./api-endpoints.md) | Current + planned endpoints |
| [pages.md](./pages.md) | Current + planned screens |

## Quick facts

- **Routing** — file-based (`src/app/`)
- **Data** — `GET api.dictionaryapi.dev/api/v2/entries/en/{word}` (no own backend yet)
- **Cache** — in-memory `Map`, keyed by lowercased word
- **History** — persisted to AsyncStorage
- **Audio** — expo-audio (plays even on silent mode)
- **Type** — Figtree (display) + Fraunces (reading)

## Source map

```
src/
├─ app/
│  ├─ _layout.tsx        providers, stack + drawer
│  ├─ index.tsx          search screen
│  └─ word/[word].tsx    word detail
├─ components/           drawer, audio button, header, icons
└─ utils/
   ├─ dictionary-api.ts  fetch, cache, suggest, word-of-day
   ├─ search-history.tsx history context + persistence
   └─ fonts.ts           type tokens
```

> _Current_ = in the code today. **Planned** = roadmap.
>
> Diagrams are Mermaid (`flowchart` / `sequence` / `class`) — paste any block into
> Excalidraw's **Mermaid to Excalidraw** import.
