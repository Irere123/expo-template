# Design — Navigation, Screens & Components

## Navigation map

```mermaid
flowchart LR
    Drawer{{"☰ Drawer\nnav + history"}}

    subgraph Stack["expo-router Stack"]
        Index["/ (index)\nSearch screen"]
        WordScreen["/word/[word]\nWord detail"]
    end

    Drawer -->|"Search"| Index
    Drawer -->|"history item"| WordScreen
    Index -->|"submit / Search btn"| WordScreen
    Index -->|"recent search"| WordScreen
    Index -->|"word of the day"| WordScreen
    WordScreen -->|"tap synonym (push)"| WordScreen
    WordScreen -->|"Did you mean? (replace)"| WordScreen
    WordScreen -->|"back"| Index
    WordScreen -->|"Search again"| Index
```

## Screen: Search (`index.tsx`) — _Current_

```
┌──────────────────────────────┐
│ ☰                            │  ← MainHeader (drawer button)
│  📖                          │
│  Dictionary                  │  ← Hero
│  Look up any word…           │
│ ┌──────────────────────────┐ │
│ │ 🔍  Search a word        │ │  ← TextInput (clears on submit)
│ └──────────────────────────┘ │
│ [        Search        ]     │  ← primary button
│                              │
│ RECENT SEARCHES      Clear   │  ← from useHistory()
│ 🕐 serendipity            ›  │
│ 🕐 ephemeral              ›  │
│                              │
│ WORD OF THE DAY              │
│ ┌──────────────────────────┐ │
│ │ petrichor  noun          │ │  ← deterministic, local
│ │ A pleasant, earthy smell…│ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

Behaviors: empty-query inline validation, `Keyboard.dismiss()` + input clear on
submit, history-driven recents, tappable word-of-the-day.

## Screen: Word detail (`word/[word].tsx`) — _Current_

Three render states driven by the fetch lifecycle:

```mermaid
flowchart TD
    L["Loading\nghost headword + spinner"]
    S["Success\nheadword · phonetics · audio pills\nmeanings grouped by part of speech\ntappable synonyms"]
    E["Error\nicon + headline + helper"]
    L --> S
    L --> E
    E -->|not-found| DYM["Did you mean? chips\n+ Go back / Search again"]
    E -->|network/unknown| RT["Retry / Go back"]
```

## Component tree

```mermaid
flowchart TD
    RootLayout --> DrawerLayout
    DrawerLayout --> DrawerContent
    DrawerLayout --> Stack
    DrawerContent --> DrawerNavItem
    DrawerContent --> DrawerHistoryItem
    Stack --> SearchScreen
    Stack --> WordScreen

    SearchScreen --> MainHeader
    SearchScreen --> Icon

    WordScreen --> WordDetails
    WordScreen --> LoadingState
    WordScreen --> ErrorState
    WordDetails --> MeaningBlock
    WordDetails --> AudioButton
    ErrorState --> ActionButton
```

## Design system tokens

| Token | Usage |
| --- | --- |
| `bg-background` / `text-foreground` | Base surface + text |
| `bg-secondary` / `bg-muted` | Cards, pills, pressed states |
| `text-muted-foreground` | Secondary text, captions |
| `border-continuous` | iOS-style continuous-corner borders |
| Fraunces serif | Headwords / display type |

- **Theme:** follows system light/dark via `useColorScheme` + RN Navigation theme.
- **Safe areas:** `react-native-safe-area-context`; iOS uses
  `contentInsetAdjustmentBehavior`, Android folds in `insets.bottom` manually.
- **Platform headers:** `main-header.ios.tsx` / `.android.tsx` / `.fallback.tsx`
  with optional liquid-glass effect when available.

## Screens to be developed

See [pages.md](./pages.md) for the full roadmap (Favorites, Settings, Onboarding,
Search results/autocomplete, Practice/Quiz, About).
