# LocalStorageProvider

A `MemoryDBProvider` that persists every collection to `localStorage` (or any other `Storage`, e.g. `sessionStorage`). Each collection is hydrated from storage once, lazily, on first access — after that all reads, queries, and realtime sequences are served synchronously from memory, and every write persists to storage before it touches memory.

Because it *is* a `MemoryDBProvider`, it plugs into everything that expects one: it seeds `ItemStore` / `QueryStore` synchronously (including via `DBCache` and the React hooks from `createDBContext()`), and it can be passed as the cache inside `CacheDBProvider` to give a remote source a persistent local mirror.

`storage` events from other tabs/windows are applied to memory and notify realtime sequences, so `getItemSequence()` / `getQuerySequence()` update live across tabs.

## Usage

```ts
import { LocalStorageProvider } from "shelving/db";

const provider = new LocalStorageProvider(); // Persists to `localStorage` under "shelving:*" keys.
if (!provider.persistent) console.warn("Changes won't be saved on this device.");

const id = await provider.addItem(POSTS, { title: "Hello", body: "First post.", published: false });
const post = await provider.getItem(POSTS, id); // Still there after a reload.
```

Pass options to change the key prefix or the backing `Storage`:

```ts
const provider = new LocalStorageProvider({ prefix: "myapp:", storage: sessionStorage });
```

As the persistent cache tier under a remote source:

```ts
import { CacheDBProvider, LocalStorageProvider } from "shelving/db";

const provider = new CacheDBProvider(new MyRemoteProvider(), new LocalStorageProvider());
```

## Reliability

Treat the persisted data as best-effort, not guaranteed:

- **Quota** is shared across the whole origin (typically ~5MB) and a write can fail at any time with `QuotaExceededError`. The provider persists *before* updating memory, so a failed write throws and changes nothing — catch it at the app level to warn the user (e.g. "we can't save data locally right now").
- **Users can clear storage** at any time, and browsers may partition or restrict it.
- **Stored data is unvalidated** — it may have been written by an older version of your app. Wrap the provider in `ValidationDBProvider`, and use `shelving/db` migrations for upgrading old shapes.

## Environment support

- **No `localStorage` at all** (Node/SSR): the constructor throws `UnsupportedError`. Construct this provider in browser code only — during SSR, render against a different provider.
- **Unusable `localStorage`** (storage access blocked by browser settings, or private browsing with zero quota): the provider degrades to memory-only operation without throwing. Check `LocalStorageProvider.persistent` to detect this and warn users their changes won't be saved.
