# Providers

This directory contains [`DBProvider`](/db/DBProvider) — the abstract base every backend implements — and all the built-in provider implementations. Providers are composable: wrap a backend in any combination of [`ValidationDBProvider`](/db/ValidationDBProvider), [`CacheDBProvider`](/db/CacheDBProvider), or [`DebugDBProvider`](/db/DebugDBProvider) to add behaviour without touching call sites.

## Concepts

### DBProvider

`DBProvider` is the abstract base class. Concrete backends implement its abstract methods; the base class provides default implementations for [`.requireItem()`](/db/DBProvider/requireItem), [`.countQuery()`](/db/DBProvider/countQuery), [`.getFirst()`](/db/DBProvider/getFirst), and [`.requireFirst()`](/db/DBProvider/requireFirst) built on top of them.

`DBProvider` implements `AsyncDisposable`. Use `await using provider = …` or `await provider[Symbol.asyncDispose]()` to release underlying connections.

SQLite realtime sequences ([`.getItemSequence()`](/db/DBProvider/getItemSequence), [`.getQuerySequence()`](/db/DBProvider/getQuerySequence)) are not supported by [`SQLProvider`](/db/SQLProvider) — they throw [`UnimplementedError`](/error/UnimplementedError). Realtime is available from [`MemoryDBProvider`](/db/MemoryDBProvider) and cloud providers.

### Provider chain

Stack providers to compose behaviour. Each wrapping provider delegates to its `source` and intercepts only what it needs. Each provider has its own page with focused usage examples.

| Provider | Role |
|---|---|
| [`MemoryDBProvider`](/db/MemoryDBProvider) | In-memory store — fast, no persistence. Use for tests and as the cache layer. |
| [`ValidationDBProvider`](/db/ValidationDBProvider) | Validates data written to and read from the source against the collection schema. Throws [`ValueError`](/error/ValueError) on bad backend data. |
| [`CacheDBProvider`](/db/CacheDBProvider) | Keeps a `MemoryDBProvider` mirror in sync with a remote source so reads arrive synchronously after the first fetch. |
| [`ThroughDBProvider`](/db/ThroughDBProvider) | Identity passthrough. Extend this to override only specific methods. |
| [`DebugDBProvider`](/db/DebugDBProvider) | Logs all operations to the console (ANSI-formatted). Extends `ThroughDBProvider`. |
| [`ChangesDBProvider`](/db/ChangesDBProvider) | Accumulates a [`.changes`](/db/ChangesDBProvider/changes) log of every write. Useful for audit trails and testing. Extends `ThroughDBProvider`. |
| [`MockDBProvider`](/db/MockDBProvider) | Extends `MemoryDBProvider` and records every call in [`.calls`](/db/MockDBProvider/calls). Use in tests to assert operations. |
| [`SQLProvider`](/db/SQLProvider) | Abstract SQL base — concrete subclasses bind it to a driver. |
| [`SQLiteProvider`](/db/SQLiteProvider) | Abstract SQL backend targeting SQLite / D1 with JSON1 support for nested keys and array operations. |
| [`PostgreSQLProvider`](/db/PostgreSQLProvider) | Abstract SQL backend targeting PostgreSQL with JSONB support. |

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

## See also

- [`db`](/db) — overview and full usage examples
- [`db`](/db) — [`Collection`](/db/Collection) / [`COLLECTION()`](/db/COLLECTION) definition
- [`db`](/db) — [`DBCache`](/db/DBCache) and [`CollectionCache`](/db/CollectionCache) for reactive store management
- [`db`](/db) — [`SQLiteMigrator`](/db/SQLiteMigrator) / [`PostgreSQLMigrator`](/db/PostgreSQLMigrator) for schema migration
- [`cloudflare`](/cloudflare) — Cloudflare KV and D1 provider implementations
- [`firestore`](/firestore/client) — Firestore provider implementation
