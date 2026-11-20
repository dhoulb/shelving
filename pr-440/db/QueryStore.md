# QueryStore

- Kind: class
- Import: `import { QueryStore } from "shelving/db";`
- Extends: `FetchStore<Items<I, T>>`
- Implements: `Iterable<Item<I, T>>`

Store that runs a query against a collection from a database provider and tracks its matching items.

- Holds an `Items` value (the array of matching items) and is iterable over those items.
- When the provider is (or wraps) a `MemoryDBProvider`, the store seeds from the memory at once and follows the live query result. An empty result only counts as loaded when the memory has a time for the query (see `MemoryTable.getQueryTime()`). Until then the store is loading, and a fetch waits until the memory loads the query (e.g. from `HydratingAPIProvider`).
- Any other provider is fetched, and its `DBProvider.getQuerySequence()` is followed while the store has subscribers. A provider that throws `UnsupportedError` for subscriptions is only fetched.
- The store does not page. To load more items into a memory, call the API with `getQueryItemsAfter()`, and the store shows the new items.

## Signatures

```ts
new QueryStore<I, T>(collection: Collection<string, I, T>, query: Query<Item<I, T>>, provider: DBProvider<I>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `collection` | `Collection<string, I, T>` |  |
| `query` | `Query<Item<I, T>>` |  |
| `provider` | `DBProvider<I>` |  |

## Returns

| Type | Description |
| --- | --- |
| `QueryStore<I, T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `provider` | `DBProvider<I>` | The database provider this store fetches its items from. Read only. |
| `collection` | `Collection<string, I, T>` | The collection the query runs against. Read only. |
| `query` | `Query<Item<I, T>>` | The query that selects the items tracked by this store. Read only. |
| `optionalFirst` | `Item<I, T> \| undefined` | The first item in this store, or `undefined` if the query has no items. Read only. |
| `optionalLast` | `Item<I, T> \| undefined` | The last item in this store, or `undefined` if the query has no items. Read only. |
| `first` | `Item<I, T>` | The first item in this store. Read only. |
| `last` | `Item<I, T>` | The last item in this store. Read only. |

## Examples

```ts
const store = new QueryStore(collection, query, provider);
 for (const item of store) console.log(item);
```
