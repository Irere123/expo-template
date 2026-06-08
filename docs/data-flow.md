# Data Flow

## 1. Word lookup (search → definition)

The core flow. A query from the search box (or a tapped synonym / history item)
resolves to a rendered definition, with caching and typed error handling.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Search as index.tsx
    participant Router as expo-router
    participant Word as word/[word].tsx
    participant API as dictionary-api.fetchWord
    participant Cache as In-memory cache
    participant Net as Free Dictionary API
    participant Hist as HistoryProvider

    User->>Search: type query + submit
    Search->>Search: validate (non-empty)
    alt empty query
        Search-->>User: inline error, stay on screen
    else valid
        Search->>Search: clear input (setQuery(""))
        Search->>Router: push /word/{word}
        Router->>Word: mount with param
        Word->>API: fetchWord(word)
        API->>Cache: get(key)
        alt cache hit
            Cache-->>API: WordEntry[]
        else cache miss
            API->>Net: GET /entries/en/{word}
            alt 200 + non-empty
                Net-->>API: WordEntry[]
                API->>Cache: set(key, data)
            else 404 / empty
                Net-->>API: throw DictionaryError("not-found")
            else no response / timeout
                Net-->>API: throw DictionaryError("network")
            else other status
                Net-->>API: throw DictionaryError("unknown")
            end
        end
        alt success
            API-->>Word: WordEntry[]
            Word->>Hist: addWord(headword)
            Word-->>User: render definitions + audio
        else error
            API-->>Word: DictionaryError
            Word-->>User: error state (+ "Did you mean?" if not-found)
        end
    end
```

## 2. Render-state machine (word screen)

```mermaid
stateDiagram-v2
    [*] --> Loading: mount / param change
    Loading --> Success: fetchWord resolves
    Loading --> Error: DictionaryError thrown
    Error --> Loading: Retry (network/unknown)
    Success --> Loading: tap synonym (push new word)
    Error --> [*]: Go back
    Success --> [*]: Go back

    state Error {
        [*] --> NotFound: kind = not-found
        [*] --> NoConnection: kind = network
        [*] --> Generic: kind = unknown
        NotFound --> Suggestions: suggestWords()
    }
```

## 3. Search history persistence

History is hydrated once on mount and written back to AsyncStorage on every change.
A `hydrated` ref guards against clobbering stored data with the empty initial state.

```mermaid
sequenceDiagram
    autonumber
    participant Provider as HistoryProvider
    participant Storage as AsyncStorage
    participant Screen as Any screen

    Note over Provider: Mount
    Provider->>Storage: getItem("dictionary:search-history")
    Storage-->>Provider: JSON string | null
    Provider->>Provider: parse + filter strings, set hydrated=true
    Provider->>Provider: mergeUnique(pending, stored)

    Note over Screen,Provider: User opens a valid word
    Screen->>Provider: addWord(headword)
    Provider->>Provider: mergeUnique([word], prev) → dedupe + cap 50
    Provider->>Storage: setItem(JSON) (only after hydrated)

    Note over Screen,Provider: User taps "Clear"
    Screen->>Provider: clearHistory()
    Provider->>Storage: setItem("[]")
```

### `mergeUnique` rules
- Trims, drops empties.
- Case-insensitive dedupe; **first** occurrence wins (most recent in front).
- Capped at `MAX_HISTORY = 50`.

## 4. Pronunciation audio

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Btn as AudioButton
    participant Player as expo-audio player
    participant CDN as Audio URL

    Note over Btn: parent passes a pronunciation URL
    User->>Btn: tap pill
    alt currently playing
        Btn->>Player: pause()
    else not playing
        Btn->>Player: seekTo(0) + play()
        Player->>CDN: stream audio
        CDN-->>Player: bytes
        Player-->>User: 🔊 plays (silent-mode allowed)
    end
    Player-->>Btn: didJustFinish → seekTo(0) + pause()
    note right of Btn: load/playback error → "label unavailable" pill
```

## 5. Data shapes

```mermaid
classDiagram
    class WordEntry {
        +string word
        +string phonetic
        +Phonetic phonetics
        +Meaning meanings
        +string sourceUrls
    }
    class Phonetic {
        +string text
        +string audio
        +string sourceUrl
    }
    class Meaning {
        +string partOfSpeech
        +Definition definitions
        +string synonyms
        +string antonyms
    }
    class Definition {
        +string definition
        +string example
        +string synonyms
    }
    class DictionaryError {
        +string kind
        +string message
    }
    WordEntry "1" --> "*" Phonetic
    WordEntry "1" --> "*" Meaning
    Meaning "1" --> "*" Definition
```

> Cardinality (`1 → *`) marks array fields (`phonetics`, `meanings`, `definitions`,
> `synonyms`). All fields except `word`, `partOfSpeech`, and `definition` are
> optional. `DictionaryError.kind` ∈ `empty | not-found | network | unknown`.
