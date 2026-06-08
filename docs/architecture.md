# System Architecture

## High-level architecture

```mermaid
flowchart TB
    subgraph Device["📱 Mobile Device (iOS / Android)"]
        direction TB

        subgraph App["Expo / React Native App"]
            direction TB

            subgraph UI["UI Layer — src/app (expo-router)"]
                Root["_layout.tsx\nRoot Stack + Drawer"]
                Search["index.tsx\nSearch screen"]
                Word["word/[word].tsx\nWord detail screen"]
            end

            subgraph Comp["Components — src/components"]
                Drawer["DrawerContent\nnav + history"]
                Audio["AudioButton\npronunciation"]
                Header["MainHeader\n(per-platform)"]
            end

            subgraph State["State / Context Providers"]
                HistoryCtx["HistoryProvider\nuseHistory()"]
                DrawerCtx["DrawerProvider\nuseDrawer()"]
            end

            subgraph Data["Data Layer — src/utils"]
                API["dictionary-api.ts\nfetchWord · cache · suggest"]
                Cache[("In-memory cache\nMap: word → WordEntry[]")]
                Hist["search-history.tsx\nmerge · cap · persist"]
            end
        end

        Storage[("AsyncStorage\ndictionary:search-history")]
        AudioHW["Device audio\n(expo-audio)"]
    end

    subgraph Cloud["☁️ External Services"]
        DictAPI["Free Dictionary API\napi.dictionaryapi.dev"]
        CDN["Pronunciation audio\n(media CDN URLs)"]
    end

    Search --> API
    Word --> API
    Word --> Audio
    Root --> HistoryCtx & DrawerCtx
    Drawer --> HistoryCtx
    Search --> HistoryCtx
    Word --> HistoryCtx

    API <--> Cache
    API -->|"HTTP GET (axios)"| DictAPI
    Hist <-->|read / write| Storage
    HistoryCtx --> Hist
    Audio -->|stream| CDN
    Audio --> AudioHW

    classDef ext fill:#fde,stroke:#c39,color:#000
    classDef store fill:#eef,stroke:#669,color:#000
    class DictAPI,CDN ext
    class Cache,Storage store
```

## Layers

| Layer | Responsibility | Key files |
| --- | --- | --- |
| **Navigation / UI** | File-based routes, screen composition, render states | `src/app/_layout.tsx`, `src/app/index.tsx`, `src/app/word/[word].tsx` |
| **Components** | Reusable presentational + interactive UI | `src/components/*` |
| **State** | Cross-screen state via React Context | `HistoryProvider`, `DrawerProvider` |
| **Data** | Network access, normalization, caching, derived helpers | `src/utils/dictionary-api.ts` |
| **Persistence** | Durable history across restarts | `src/utils/search-history.tsx` + AsyncStorage |
| **External** | Definitions + audio (third-party) | Free Dictionary API + media CDN |

## Provider composition (runtime tree)

```mermaid
flowchart TD
    A["RootLayout"] --> B["ThemeProvider (RN Navigation theme)"]
    B --> C["KeyboardProvider"]
    C --> D["HistoryProvider"]
    D --> E["DrawerProvider"]
    E --> F["RootDrawer → DrawerLayout"]
    F --> G["StackLayout (expo-router Stack)"]
    G --> H["index / word screens"]
```

## Tech stack

- **Framework:** Expo SDK 54, React Native 0.81, React 19
- **Routing:** expo-router 6 (file-based, typed routes)
- **HTTP:** axios (typed responses + `DictionaryError` mapping)
- **Storage:** `@react-native-async-storage/async-storage`
- **Audio:** expo-audio
- **Styling:** uniwind + Tailwind v4, `clsx` / `tailwind-merge`
- **Typography:** Fraunces serif (`@expo-google-fonts/fraunces`)
- **Icons:** lucide-react-native
- **Effects:** expo-blur, expo-glass-effect, react-native-reanimated, gesture-handler

## Architectural notes / constraints

- **No backend today.** The app is a thin client over a public API. Anything
  requiring accounts, sync, or server-side logic is **to be developed**
  (see [api-endpoints.md](./api-endpoints.md)).
- **Cache is volatile.** The lookup cache is a module-level `Map`; it is cleared
  on app restart. Only search _history_ (the list of words) is persisted, not the
  full definitions.
- **Suggestions are on-device.** "Did you mean?" uses Levenshtein distance against
  a bundled common-word list + the user's history — no network call.
- **Word of the day is deterministic & local.** Rotates by day-of-year over a
  curated array; no server involved.
