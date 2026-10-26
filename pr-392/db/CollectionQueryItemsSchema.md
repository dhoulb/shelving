# CollectionQueryItemsSchema

- Kind: class
- Import: `import { CollectionQueryItemsSchema } from "shelving/db";`
- Extends: `DataSchema<QueryItems<I, T>>`
- Implements: `Sourceable<Collection<string, I, T>>`

Schema for `QueryItems` of a `Collection`, i.e. a query and the complete list of items that answer it.

- Built by `Collection` as `Collection.queryItems`, from `Collection.query` and `Collection.items`. Use that instance, and do not make your own.
- **Do not trust the `query` in a value that this schema validates.** `Collection.query` only checks that it is an object. The `items` are validated in full.
- Its `source` is the `Collection`, so `getSource()` can find the collection from the schema.
- `HydratingAPIProvider` writes an endpoint result that uses this schema into its database, and marks the query as loaded (see `MemoryTable.getQueryTime()`), so a store for the same query shows the items without loading.
- Only use it when `items` is the complete answer to `query` (with its `$limit`).

## Signatures

```ts
new CollectionQueryItemsSchema<I, T>(collection: Collection<string, I, T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `collection` | `Collection<string, I, T>` |  |

## Returns

| Type | Description |
| --- | --- |
| `CollectionQueryItemsSchema<I, T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `source` | `Collection<string, I, T>` | The collection this schema validates items of. Read only. |

## Examples

```ts
const MY_CHALLENGES = GET("/challenge/me", undefined, DATA({ challenges: CHALLENGES.queryItems }));
```
