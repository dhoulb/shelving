# ItemStore

- Kind: class
- Import: `import { ItemStore } from "shelving/db";`
- Extends: `FetchStore<OptionalItem<I, T>>`

Store that fetches and tracks a single item by ID in a collection from a database provider.

- Holds an `OptionalItem` value: the item if it exists, or `undefined` if it doesn't.
- When the provider is (or wraps) a `MemoryDBProvider`, the store seeds from the memory at once and follows its changes. A missing item only counts as loaded when the memory has a time for it (see `MemoryTable.getItemTime()`). Until then the store is loading, and a fetch waits until the memory loads the item (e.g. from `HydratingAPIProvider`).
- Any other provider is fetched, and its `DBProvider.getItemSequence()` is followed while the store has subscribers. A provider that throws `UnsupportedError` for subscriptions is only fetched.

## Signatures

```ts
new ItemStore<I, T>(collection: Collection<string, I, T>, id: I, provider: DBProvider<I>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `collection` | `Collection<string, I, T>` |  |
| `id` | `I` |  |
| `provider` | `DBProvider<I>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ItemStore<I, T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `provider` | `DBProvider<I>` | The database provider this store fetches its item from. Read only. |
| `collection` | `Collection<string, I, T>` | The collection the item lives in. Read only. |
| `id` | `I` | The ID of the item this store tracks. Read only. |
| `item` | `Item<I, T>` | The required item data of this store. - Use this when the item is known to exist; use `value` when it may be `undefined`. |

## Examples

```ts
const store = new ItemStore(collection, "abc", provider);
 const item = await store; // OptionalItem<I, T>
```
