# OptionalDataStore

- Kind: class
- Import: `import { OptionalDataStore } from "shelving/store";`
- Extends: `BusyStore<T | undefined>`

Store a data object that may be `undefined` (e.g. a document that may not exist).
- Reading `data` or calling `require()` throws `RequiredError` when the value is `undefined`.
- `delete()` sets the value back to `undefined`.

## Signatures

```ts
new OptionalDataStore<T>()
```

## Returns

| Type | Description |
| --- | --- |
| `OptionalDataStore<T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `data` | `T` | Get the current data of this store, or throw if it is not set. - Supports suspense-like reads: throws a `Promise` while loading or the error `reason` on failure (inherited from `Store.value`). |
| `exists` | `boolean` | Whether the data currently exists (is not `undefined`). Read only. |

## Methods

- [OptionalDataStore.require()](OptionalDataStore/require.md): Require the data of this store, or throw RequiredError if it is not set.
- [OptionalDataStore.update()](OptionalDataStore/update.md): Update several props in this data.
- [OptionalDataStore.get()](OptionalDataStore/get.md): Get a single named prop from this data.
- [OptionalDataStore.set()](OptionalDataStore/set.md): Set a single named prop in this data.
- [OptionalDataStore.delete()](OptionalDataStore/delete.md): Set the data to undefined.
