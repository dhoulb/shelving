# CollectionItemsSchema

- Kind: class
- Import: `import { CollectionItemsSchema } from "shelving/db";`
- Extends: `ArraySchema<Item<I, T>>`
- Implements: `Sourceable<Collection<string, I, T>>`

Schema for a list of complete items (`id` + data) of a `Collection`.

- Built by `Collection` as `Collection.items`. Use that instance, and do not make your own.
- Its `source` is the `Collection`, so `getSource()` can find the collection from the schema.
- `HydratingAPIProvider` writes an endpoint result that uses this schema into its database. It only adds and replaces items, and never deletes them.
- `ARRAY(USERS.item)` validates the same value, but it does not point at the collection, so it does not hydrate. Use `USERS.items`.

## Signatures

```ts
new CollectionItemsSchema<I, T>(collection: Collection<string, I, T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `collection` | `Collection<string, I, T>` |  |

## Returns

| Type | Description |
| --- | --- |
| `CollectionItemsSchema<I, T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `source` | `Collection<string, I, T>` | The collection this schema validates items of. Read only. |

## Examples

```ts
const LIST_USERS = GET("/user", undefined, USERS.items);
```
