# Stores

`ItemStore` and `QueryStore` are reactive, database-backed stores. Each one holds the current value of a single item or query result and re-fetches from the provider when asked. They integrate with React Suspense — reading `.value` while loading throws a `Promise` that Suspense catches.

Both extend `FetchStore` from the `shelving/store` module, which manages the loading / error / ready lifecycle and the `refresh(maxAge?)` method.

## Concepts

### ItemStore

`ItemStore<I, T>` holds `OptionalItem<I, T>` — the current item, or `undefined` if it does not exist. It calls `DBProvider.getItem()` on the first fetch and whenever `refresh()` is called.

- `ItemStore.item` — returns the item or throws `RequiredError` if absent. Safe to use once the store is loaded and you know the item exists.
- `.item = data` — write helper that sets `.value` to `getItem()` directly (bypasses the provider; useful for optimistic updates).

When a `MemoryDBProvider` is supplied (via `DBCache` reusing the `CacheDBProvider` mirror), the store seeds its initial value from the in-memory snapshot and subscribes to live changes via `DBProvider.getItemSequence()`. This makes the first render synchronous if the data is already cached.

### QueryStore

`QueryStore<I, T>` holds `Items<I, T>` — a readonly array of matching items. It calls `DBProvider.getQuery()` on the first fetch. Like `ItemStore`, it seeds from memory when available.

Additional accessors beyond the base `FetchStore`:

- `QueryStore.first` / `QueryStore.last` — the first or last item; throw `RequiredError` if the result is empty.
- `QueryStore.optionalFirst` / `QueryStore.optionalLast` — same, returning `undefined` instead of throwing.
- `QueryStore.limit` — the `$limit` from the query, or `Infinity` if not set.
- `QueryStore.hasMore` — whether a subsequent page fetch might return more results (not yet implemented, reserved).
- `[Symbol.iterator]` — `QueryStore` is directly iterable, so `for...of store` works.

## Usage

### Direct instantiation

You do not usually create these stores directly. `DBCache` manages them so only one store exists per (collection, id-or-query). Direct use is shown here for clarity.

```ts
import { ItemStore, QueryStore } from "shelving/db";

const itemStore = new ItemStore(POSTS, "abc", provider);
await itemStore.refresh();        // Fetches from provider.
console.log(itemStore.value);     // { id: "abc", title: "…", … } or undefined

const queryStore = new QueryStore(POSTS, { published: true, $order: "title" }, provider);
await queryStore.refresh();
for (const post of queryStore) {
  console.log(post.id, post.title);
}
```

### With a memory cache (synchronous first render)

```ts
import { CacheDBProvider, ValidationDBProvider, MemoryDBProvider, DBCache } from "shelving/db";

const memory = new MemoryDBProvider();
const provider = new CacheDBProvider(new ValidationDBProvider(memory));
const cache = new DBCache(provider);

// After a prior fetch has populated the CacheDBProvider's mirror,
// this store starts loaded synchronously — no Suspense boundary needed.
const store = cache.getItem(POSTS, "abc");
console.log(store.loading); // false if already in cache
```

### React Suspense integration

In a React app, use `createDBContext()` instead of managing stores manually. The context wraps a `DBCache` and the `DBContext.useItem()` / `DBContext.useQuery()` hooks handle Suspense automatically.
