# CacheDBProvider

A wrapping provider that keeps an in-memory mirror in sync with a remote source. `CacheDBProvider` extends `ThroughDBProvider`, holds a `MemoryDBProvider`, and populates it as data is read and written, so subsequent reads are synchronous — the basis of synchronous first renders in the React integration.

The constructor takes the `source` provider and an optional `MemoryDBProvider` to use as the mirror (one is created by default).

## Usage

```ts
import { CacheDBProvider, ValidationDBProvider, MemoryDBProvider } from "shelving/db";

const provider = new CacheDBProvider(
  new ValidationDBProvider(new MemoryDBProvider())
);

await provider.getItem(POSTS, "abc"); // fetches from source, populates the mirror
await provider.getItem(POSTS, "abc"); // served synchronously from the mirror
```

`DBCache` finds the `CacheDBProvider` in a chain automatically and reuses its mirror to seed reactive stores.

## Fetch-first writes

Writes that depend on existing data fetch before they write, so every write leaves the touched items cached and the cache mirrors exactly what changed:

- `CacheDBProvider.updateItem()` and `CacheDBProvider.deleteItem()` fetch the item first (caching it) and skip the source write when it doesn't exist.
- Query writes (`setQuery`, `updateQuery`, `deleteQuery`) are inherited two-step and resolve through the cache's own `getQuery()`, so the matched items are fetched and cached first, then each per-item write mirrors exactly — never a query replayed against the cache's subset.

The fetch and the writes are separate operations against `source`, so a concurrent change can slip between them — wrap the call in `transact()` when that matters, because inside a transaction both steps run in the source transaction and are atomic.

## Transactions

`CacheDBProvider.transact()` runs the transaction on `source` and hands the callback this cache over the source's transaction, backed by a transaction-scoped mirror — so reads, fetch-first writes, and query resolution behave exactly as they do outside a transaction. The callback's operations are recorded with `RecordingDBProvider`, and once the source commits, the recorded writes are committed into the real cache with `RecordingDBProvider.replayWrites()`.

Uncommitted data never touches the cache — a thrown callback commits nothing, and if the backend retries the callback only the committed attempt's writes are mirrored. Update writes commit as deltas, so they refresh cached items and skip uncached ones; an item only *read* inside a transaction stays uncached until its next read. (The recording also holds the reads, so a future refinement could commit those with `RecordingDBProvider.replay()`.)
