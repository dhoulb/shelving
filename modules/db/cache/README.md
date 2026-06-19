# Cache

`DBCache` and `CollectionCache` are the store-management layer that sits between a `DBProvider` and the reactive `ItemStore` / `QueryStore` instances used by UI code. They ensure that only one store exists per (collection, id) or (collection, query) pair and expose a `refresh` API to pull fresh data on demand.

## Concepts

### DBCache

`DBCache` is a registry of `CollectionCache` objects, one per `Collection`. Call `DBCache.getItem()` or `DBCache.getQuery()` to retrieve or lazily create a store. Calling the same method twice with the same arguments returns the exact same store instance.

If the provider chain contains a `CacheDBProvider`, `DBCache` finds it automatically via `getSource` and reuses its `MemoryDBProvider` mirror. Stores are then seeded with the current in-memory snapshot and subscribe to live updates from it — so the first render is synchronous when data is already cached.

### CollectionCache

`CollectionCache` manages stores for a single collection. It is used internally by `DBCache` but is also available directly when you need per-collection refresh control.

- `CollectionCache.getItem()` — returns an `ItemStore` for the id, creating it if needed.
- `CollectionCache.getQuery()` — returns a `QueryStore` for the query, keyed by `JSON.stringify(query)`.
- `CollectionCache.refreshItem()` / `CollectionCache.refreshItems()` — re-fetch one or all item stores.
- `CollectionCache.refreshQuery()` / `CollectionCache.refreshQueries()` — re-fetch one or all query stores.
- `CollectionCache.refreshAll()` — re-fetch everything in this collection at once.

Both `DBCache` and `CollectionCache` implement `AsyncDisposable`. Disposing them disposes every store they hold.

## Usage

### Create a cache and look up stores

```ts
import { DBCache, CacheDBProvider, ValidationDBProvider, MemoryDBProvider } from "shelving/db";

const provider = new CacheDBProvider(new ValidationDBProvider(new MemoryDBProvider()));
const cache = new DBCache(provider);

// Returns an ItemStore — created lazily, reused on subsequent calls.
const postStore = cache.getItem(POSTS, "abc");

// Returns a QueryStore.
const publishedStore = cache.getQuery(POSTS, { published: true, $order: "title" });
```

### Refresh after a write

```ts
await provider.updateItem(POSTS, "abc", { published: true });

// Re-fetch just this item.
await cache.refreshItem(POSTS, "abc");

// Or re-fetch everything for this collection.
await cache.refreshAll(POSTS);
```

### Refresh with a max age

Pass `maxAge` (milliseconds) to skip the refresh if the store was fetched recently:

```ts
// Only refresh if the store is older than 30 seconds.
await cache.refreshItems(POSTS, 30_000);
```

### Dispose when done

```ts
await using cache = new DBCache(provider);
// All stores are disposed automatically when cache goes out of scope.
```
