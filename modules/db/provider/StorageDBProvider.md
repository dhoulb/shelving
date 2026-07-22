# StorageDBProvider

A `MemoryDBProvider` that persists every collection to a `Storage` — `localStorage`, `sessionStorage`, or anything else with the same interface. Each collection is hydrated from storage once, lazily, on first access — after that all reads, queries, and realtime sequences are served synchronously from memory, and every write persists to storage before it touches memory.

Because it *is* a `MemoryDBProvider`, it plugs into everything that expects one: it seeds `ItemStore` / `QueryStore` synchronously (including via `DBCache` and the React hooks from `createDBContext()`), and it can be passed as the cache inside `CacheDBProvider` to give a remote source a persistent local mirror.

`storage` events from other tabs/windows are applied to memory and notify realtime sequences, so `getItemSequence()` / `getQuerySequence()` update live across tabs.

## Usage

The storage to persist to is a required argument — there is no default, so server code that constructs this provider must reference `localStorage` / `sessionStorage` itself, surfacing the mistake at the callsite (at compile time, in a project without DOM types) rather than deep inside the class:

```ts
import { StorageDBProvider } from "shelving/db";

const provider = new StorageDBProvider(localStorage); // Persists under "shelving:*" keys.
if (!provider.persistent) console.warn("Changes won't be saved on this device.");

const id = await provider.addItem(POSTS, { title: "Hello", body: "First post.", published: false });
const post = await provider.getItem(POSTS, id); // Still there after a reload.
```

Pass `sessionStorage` for per-tab persistence, and a prefix to namespace keys:

```ts
const provider = new StorageDBProvider(sessionStorage, "myapp:");
```

As the persistent cache tier under a remote source:

```ts
import { CacheDBProvider, StorageDBProvider } from "shelving/db";

const provider = new CacheDBProvider(new MyRemoteProvider(), new StorageDBProvider(localStorage));
```

## Reliability

Treat the persisted data as best-effort, not guaranteed:

- **Quota** is shared across the whole origin (typically ~5MB) and a write can fail at any time with `QuotaExceededError`. The provider persists *before* updating memory, so a failed write throws and changes nothing — catch it at the app level to warn the user (e.g. "we can't save data locally right now").
- **Users can clear storage** at any time, and browsers may partition or restrict it.
- **Unusable storage** (writes blocked by browser settings, or private browsing with zero quota) makes the provider degrade to memory-only operation without throwing. Check `StorageDBProvider.persistent` to detect this and warn users their changes won't be saved.
- **Stored data is unvalidated** — it may have been written by an older version of your app. Wrap the provider in `ValidationDBProvider`, and use `shelving/db` migrations for upgrading old shapes.

Passing nothing at runtime (a plain-JS caller with no type checking) throws `UnsupportedError`.
