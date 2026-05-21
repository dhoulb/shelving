# Providers

This directory contains `DBProvider` — the abstract base every backend implements — and all the built-in provider implementations. Providers are composable: wrap a backend in any combination of `ValidationDBProvider`, `CacheDBProvider`, or `DebugDBProvider` to add behaviour without touching call sites.

## Concepts

### DBProvider

`DBProvider` is the abstract base class. Concrete backends implement its abstract methods; the base class provides default implementations for `requireItem`, `countQuery`, `getFirst`, and `requireFirst` built on top of them.

`DBProvider` implements `AsyncDisposable`. Use `await using provider = …` or `await provider[Symbol.asyncDispose]()` to release underlying connections.

SQLite realtime sequences (`getItemSequence`, `getQuerySequence`) are not supported by `SQLProvider` — they throw `UnimplementedError`. Realtime is available from `MemoryDBProvider` and cloud providers.

### Provider chain

Stack providers to compose behaviour. Each wrapping provider delegates to its `source` and intercepts only what it needs.

| Provider | Role |
|---|---|
| `MemoryDBProvider` | In-memory store — fast, no persistence. Use for tests and as the cache layer. |
| `ValidationDBProvider` | Validates data written to and read from the source against the collection schema. Throws `ValueError` on bad backend data. |
| `CacheDBProvider` | Keeps a `MemoryDBProvider` mirror in sync with a remote source so reads arrive synchronously after the first fetch. |
| `ThroughDBProvider` | Identity passthrough. Extend this to override only specific methods. |
| `DebugDBProvider` | Logs all operations to the console (ANSI-formatted). Extends `ThroughDBProvider`. |
| `ChangesDBProvider` | Accumulates a `.changes` log of every write. Useful for audit trails and testing. Extends `ThroughDBProvider`. |
| `MockDBProvider` | Extends `MemoryDBProvider` and records every call in `.calls`. Use in tests to assert operations. |
| `SQLiteProvider` | Abstract SQL backend targeting SQLite/D1 with JSON1 support for nested keys and array operations. |
| `PostgreSQLProvider` | Abstract SQL backend targeting PostgreSQL with JSONB support. |

### Extending ThroughDBProvider

`ThroughDBProvider` is the right base for any intercepting layer. Override only the methods you care about and call `super` to delegate the rest:

```ts
import { ThroughDBProvider } from "shelving/db";

class TimingDBProvider extends ThroughDBProvider {
  override async getItem(collection, id) {
    const t = performance.now();
    const result = await super.getItem(collection, id);
    console.log(`getItem took ${performance.now() - t}ms`);
    return result;
  }
}
```

### SQL providers

`SQLProvider` is the abstract SQL base. Concrete subclasses must implement `exec<X>(strings, ...values)` to run a parameterised query and return rows as plain objects. `SQLiteProvider` and `PostgreSQLProvider` extend `SQLProvider` with dialect-specific JSON path syntax, array operations (`with` / `omit`), and generated column support.

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

### Testing with MockDBProvider

```ts
import { MockDBProvider } from "shelving/db";

const mock = new MockDBProvider();
await mock.addItem(POSTS, { title: "Hello", body: "", published: false });

console.log(mock.calls[0]);
// { type: "addItem", collection: "posts", data: { ... }, result: <id> }
```

### Tracking writes with ChangesDBProvider

```ts
import { ChangesDBProvider, MemoryDBProvider } from "shelving/db";

const db = new ChangesDBProvider(new MemoryDBProvider());
await db.setItem(POSTS, "abc", { title: "Hi", body: "", published: true });

console.log(db.changes);
// [{ action: "set", collection: "posts", id: "abc", data: { ... } }]
```

## See also

- [db](/db) — overview and full usage examples
- [db/collection](/db/collection) — `Collection` / `COLLECTION` definition
- [db/cache](/db/cache) — `DBCache` and `CollectionCache` for reactive store management
- [db/migrate](/db/migrate) — `SQLiteMigrator` / `PostgreSQLMigrator` for schema migration
- [cloudflare](/cloudflare) — Cloudflare KV and D1 provider implementations
- [firestore](/firestore) — Firestore provider implementation
