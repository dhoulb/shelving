# Providers

This directory contains `DBProvider` — the abstract base every backend implements — and all the built-in provider implementations. Providers are composable: wrap a backend in any combination of `ValidationDBProvider`, `CacheDBProvider`, or `DebugDBProvider` to add behaviour without touching call sites.

## Concepts

### DBProvider

`DBProvider` is the abstract base class. Concrete backends implement its abstract methods; the base class provides default implementations for `DBProvider.requireItem()`, `DBProvider.countQuery()`, `DBProvider.getFirst()`, and `DBProvider.requireFirst()` built on top of them.

`DBProvider` implements `AsyncDisposable`. Use `await using provider = …` or `await provider[Symbol.asyncDispose]()` to release underlying connections.

SQLite realtime sequences (`DBProvider.getItemSequence()`, `DBProvider.getQuerySequence()`) are not supported by `SQLProvider` — they throw `UnsupportedError`. Realtime is available from `MemoryDBProvider` and cloud providers.

### Provider chain

Stack providers to compose behaviour. Each wrapping provider delegates to its `source` and intercepts only what it needs. Each provider has its own page with focused usage examples.

| Provider | Role |
|---|---|
| `MemoryDBProvider` | In-memory store — fast, no persistence. Use for tests and as the cache layer. |
| `LocalStorageProvider` | Extends `MemoryDBProvider` and persists every collection to `localStorage`, with cross-tab sync. Browser-only. |
| `ValidationDBProvider` | Validates data written to and read from the source against the collection schema. Throws `ValueError` on bad backend data. |
| `CacheDBProvider` | Keeps a `MemoryDBProvider` mirror in sync with a remote source so reads arrive synchronously after the first fetch. |
| `ThroughDBProvider` | Identity passthrough. Extend this to override only specific methods. |
| `DebugDBProvider` | Logs all operations to the console (ANSI-formatted). Extends `ThroughDBProvider`. |
| `ChangesDBProvider` | Accumulates a `ChangesDBProvider.changes` log of every write. Useful for audit trails and testing. Extends `ThroughDBProvider`. |
| `MockDBProvider` | Extends `MemoryDBProvider` and records every call in `MockDBProvider.calls`. Use in tests to assert operations. |
| `SQLProvider` | Abstract SQL base — concrete subclasses bind it to a driver. |
| `SQLiteProvider` | Abstract SQL backend targeting SQLite / D1 with JSON1 support for nested keys and array operations. |
| `PostgreSQLProvider` | Abstract SQL backend targeting PostgreSQL with JSONB support. |

## Usage

### Typical production chain

```ts
import { CacheDBProvider, ValidationDBProvider } from "shelving/db";
// Import a concrete SQL or cloud backend from the relevant module.
import { MyConcreteProvider } from "./my-provider";

const provider = new CacheDBProvider(
  new ValidationDBProvider(
    new MyConcreteProvider()
  )
);
```

`ValidationDBProvider` sits between the cache and the backend so bad data from the database surfaces as a `ValueError` before it reaches the cache.
