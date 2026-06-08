# Architecture

## System

```mermaid
flowchart TB
  subgraph App["Mobile App — Expo / React Native"]
    UI["UI / Screens (expo-router)"]
    Ctx["Context (History, Drawer)"]
    Data["Data layer (dictionary-api)"]
    Cache[("In-memory cache")]
  end
  Storage[("AsyncStorage")]
  DictAPI["Free Dictionary API"]
  CDN["Audio CDN"]

  UI --> Ctx
  UI --> Data
  Data --> Cache
  Data -->|HTTP GET| DictAPI
  Ctx -->|history| Storage
  UI -->|pronunciation| CDN
```

## Layers

| Layer | Role | Files |
| --- | --- | --- |
| Screens | routes, render states | `app/*` |
| Context | shared state | `search-history.tsx`, `drawer-content.tsx` |
| Data | fetch, cache, helpers | `dictionary-api.ts` |
| External | definitions + audio | Free Dictionary API + CDN |

## Provider tree

```mermaid
flowchart TB
  Theme["ThemeProvider"] --> Keyboard["KeyboardProvider"]
  Keyboard --> History["HistoryProvider"]
  History --> Drawer["DrawerProvider"]
  Drawer --> Stack["Stack (index, word)"]
```

## Stack

- Expo SDK 54 · React Native 0.81 · React 19
- expo-router 6 · axios · AsyncStorage · expo-audio
- uniwind + Tailwind v4 · lucide icons
- Figtree (display) + Fraunces (reading)

## Notes

- No backend today — thin client over a public API.
- Cache is volatile (cleared on restart); only the history list persists.
- "Did you mean?" suggestions and word-of-the-day are computed on-device.
