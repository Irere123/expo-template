# Data Flow

## Word lookup

```mermaid
flowchart TB
  Q["Query: submit / recent / synonym"] --> V{"Empty?"}
  V -->|yes| E0["Inline error, stay"]
  V -->|no| Nav["Navigate to /word/{word}"]
  Nav --> F["fetchWord(word)"]
  F --> C{"In cache?"}
  C -->|yes| OK["Render definitions"]
  C -->|no| Net["GET /entries/en/{word}"]
  Net --> R{"Result?"}
  R -->|200 + data| Save["Cache + add to history"]
  Save --> OK
  R -->|404 / empty| NF["not-found: did you mean?"]
  R -->|no response| NetErr["network error: retry"]
  R -->|other status| Unk["unknown error: retry"]
```

## Word screen states

```mermaid
flowchart LR
  Load["Loading"] --> Success["Success"]
  Load --> Error["Error"]
  Success -->|tap synonym| Load
  Error -->|retry| Load
  Error -->|not-found| Suggest["Did you mean? chips"]
```

## History persistence

```mermaid
sequenceDiagram
  participant S as Screen
  participant P as HistoryProvider
  participant A as AsyncStorage
  Note over P,A: on mount
  P->>A: getItem(history)
  A-->>P: stored words
  Note over S,A: on valid lookup
  S->>P: addWord(word)
  P->>P: dedupe + cap 50
  P->>A: setItem(history)
```

## Data shapes

```mermaid
classDiagram
  class WordEntry {
    string word
    string phonetic
  }
  class Phonetic {
    string text
    string audio
  }
  class Meaning {
    string partOfSpeech
  }
  class Definition {
    string definition
    string example
  }
  WordEntry --> Phonetic
  WordEntry --> Meaning
  Meaning --> Definition
```

- `WordEntry` has many `phonetics` and `meanings`; each `Meaning` has many
  `definitions` plus optional `synonyms` / `antonyms`.
- Errors are typed: `kind` ∈ `empty · not-found · network · unknown`.
