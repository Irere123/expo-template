# Design

## Navigation

```mermaid
flowchart LR
  Drawer["Drawer: nav + history"]
  Index["/ Search"]
  Word["/word/[word]"]
  Drawer --> Index
  Drawer --> Word
  Index -->|submit / recent / word of day| Word
  Word -->|tap synonym| Word
  Word -->|back / search again| Index
```

## Screens

| Screen | Purpose | States |
| --- | --- | --- |
| Search (`index.tsx`) | hero, search box, recents, word of day | input / validation error |
| Word detail (`word/[word].tsx`) | meanings, phonetics, audio, synonyms | loading / success / error |
| Drawer (`drawer-content.tsx`) | Search nav + persisted history | empty / populated |

## Component tree

```mermaid
flowchart TB
  Root["RootLayout"] --> DL["DrawerLayout"]
  DL --> DC["DrawerContent"]
  DL --> Stack["Stack"]
  Stack --> Search["SearchScreen"]
  Stack --> WordScreen["WordScreen"]
  WordScreen --> Details["WordDetails"]
  WordScreen --> ErrState["ErrorState"]
  Details --> Meaning["MeaningBlock"]
  Details --> Audio["AudioButton"]
```

## Tokens

| Token | Usage |
| --- | --- |
| `bg-background` / `text-foreground` | base surface + text |
| `bg-secondary` / `bg-muted` | cards, pills, pressed states |
| `text-muted-foreground` | secondary text, captions |
| `border-continuous` | iOS continuous-corner borders |
| Figtree | display type (title, headwords) |
| Fraunces | reading type (definitions, examples) |

- Theme follows system light/dark.
- Safe areas via `react-native-safe-area-context`; platform-specific headers
  (`main-header.ios` / `.android` / `.fallback`) with optional liquid glass.
