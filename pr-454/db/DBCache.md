# DBCache

- Kind: class
- Import: `import { DBCache } from "shelving/db";`
- Implements: `AsyncDisposable`

Cache of `CollectionCache` objects for multiple collections.
- Use `get(collection)` to retrieve or create the `CollectionCache` for a given collection,
  then `getItem(id)` / `getQuery(query)` on that to get a specific store.
- If the provider is (or wraps) a `MemoryDBProvider`, the stores seed from it synchronously.

## Signatures

```ts
new DBCache<I, T>(provider: DBProvider<I, T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `provider` | `DBProvider<I, T>` |  |

## Returns

| Type | Description |
| --- | --- |
| `DBCache<I, T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `provider` | `DBProvider<I, T>` | The database provider the cached stores fetch from. Read only. |

## Examples

```ts
const cache = new DBCache(provider);
 const store = cache.getItem(collection, "abc");
```

## Methods

- [DBCache.get()](DBCache/get.md): Get (or create) the CollectionCache for the given collection.
- [DBCache.getItem()](DBCache/getItem.md): Get (or create) an ItemStore for a collection/id in one hop.
- [DBCache.getQuery()](DBCache/getQuery.md): Get (or create) a QueryStore for a collection/query in one hop.
- [DBCache.refreshItem()](DBCache/refreshItem.md): Refresh a specific item store for a collection.
- [DBCache.refreshItems()](DBCache/refreshItems.md): Refresh every cached item store for a collection.
- [DBCache.refreshQuery()](DBCache/refreshQuery.md): Refresh a specific query store for a collection.
- [DBCache.refreshQueries()](DBCache/refreshQueries.md): Refresh every cached query store for a collection.
- [DBCache.refreshAll()](DBCache/refreshAll.md): Refresh every cached store (items and queries) for a collection.
