# Stores

[`ItemStore`](/db/ItemStore) and [`QueryStore`](/db/QueryStore) are reactive, database-backed stores. Each one holds the current value of a single item or query result and re-fetches from the provider when asked. They integrate with React Suspense — reading `.value` while loading throws a `Promise` that Suspense catches.

Both extend [`FetchStore`](/store/FetchStore) from the [`store`](/store) module, which manages the loading / error / ready lifecycle and the `refresh(maxAge?)` method.

## Concepts

### ItemStore

`ItemStore<I, T>` holds [`OptionalItem<I, T>`](/util/item/OptionalItem) — the current item, or `undefined` if it does not exist. It calls [`.getItem()`](/db/DBProvider/getItem) on the first fetch and whenever `refresh()` is called.

- [`.item`](/db/ItemStore/item) — returns the item or throws [`RequiredError`](/error/RequiredError) if absent. Safe to use once the store is loaded and you know the item exists.
- `.item = data` — write helper that sets `.value` to [`getItem()`](/util/item/getItem) directly (bypasses the provider; useful for optimistic updates).

When a [`MemoryDBProvider`](/db/MemoryDBProvider) is supplied (via [`DBCache`](/db/DBCache) reusing the [`CacheDBProvider`](/db/CacheDBProvider) mirror), the store seeds its initial value from the in-memory snapshot and subscribes to live changes via [`.getItemSequence()`](/db/DBProvider/getItemSequence). This makes the first render synchronous if the data is already cached.

### QueryStore

`QueryStore<I, T>` holds [`Items<I, T>`](/util/item/Items) — a readonly array of matching items. It calls [`.getQuery()`](/db/DBProvider/getQuery) on the first fetch. Like `ItemStore`, it seeds from memory when available.

Additional accessors beyond the base `FetchStore`:

- [`.first`](/db/QueryStore/first) / [`.last`](/db/QueryStore/last) — the first or last item; throw `RequiredError` if the result is empty.
- [`.optionalFirst`](/db/QueryStore/optionalFirst) / [`.optionalLast`](/db/QueryStore/optionalLast) — same, returning `undefined` instead of throwing.
- [`.limit`](/db/QueryStore/limit) — the `$limit` from the query, or `Infinity` if not set.
- [`.hasMore`](/db/QueryStore/hasMore) — whether a subsequent page fetch might return more results (not yet implemented, reserved).
- `[Symbol.iterator]` — `QueryStore` is directly iterable, so `for...of store` works.

## Usage

### Direct instantiation

You do not usually create these stores directly. [`DBCache`](/db/DBCache) manages them so only one store exists per (collection, id-or-query). Direct use is shown here for clarity.

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

In a React app, use [`createDBContext()`](/react/createDBContext) instead of managing stores manually. The context wraps a `DBCache` and the [`.useItem()`](/react/DBContext/useItem) / [`.useQuery()`](/react/DBContext/useQuery) hooks handle Suspense automatically.

## See also

- [`store`](/store) — [`FetchStore`](/store/FetchStore), [`OptionalDataStore`](/store/OptionalDataStore), [`ArrayStore`](/store/ArrayStore) base classes
- [`db`](/db) — [`DBCache`](/db/DBCache) / [`CollectionCache`](/db/CollectionCache) that manage store instances
- [`react`](/react) — [`createDBContext()`](/react/createDBContext) for React hook integration
