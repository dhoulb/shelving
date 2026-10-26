# CollectionCache

- Kind: class
- Import: `import { CollectionCache } from "shelving/db";`
- Implements: `AsyncDisposable`

Cache of `ItemStore` and `QueryStore` objects for a single collection.
- Use `getItem(id)` to retrieve or create the `ItemStore` for a given id.
- Use `getQuery(query)` to retrieve or create the `QueryStore` for a given query.

## Signatures

```ts
new CollectionCache<I, T>(collection: Collection<string, I, T>, provider: DBProvider<I>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `collection` | `Collection<string, I, T>` |  |
| `provider` | `DBProvider<I>` |  |

## Returns

| Type | Description |
| --- | --- |
| `CollectionCache<I, T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `collection` | `Collection<string, I, T>` | The collection these cached stores belong to. Read only. |
| `provider` | `DBProvider<I>` | The database provider the cached stores fetch from. Read only. |

## Examples

```ts
const cache = new CollectionCache(collection, provider);
 const store = cache.getItem("abc");
```

## Methods

- [getItem](CollectionCache/getItem.md): Get (or create) the ItemStore for the given id.
- [getQuery](CollectionCache/getQuery.md): Get (or create) the QueryStore for the given query.
- [refreshItem](CollectionCache/refreshItem.md): Refresh a specific item store.
- [refreshItems](CollectionCache/refreshItems.md): Refresh every cached item store.
- [refreshQuery](CollectionCache/refreshQuery.md): Refresh a specific query store.
- [refreshQueries](CollectionCache/refreshQueries.md): Refresh every cached query store.
- [refreshAll](CollectionCache/refreshAll.md): Refresh every cached store (items and queries).
