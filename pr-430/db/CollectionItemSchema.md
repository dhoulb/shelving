# CollectionItemSchema

- Kind: class
- Import: `import { CollectionItemSchema } from "shelving/db";`
- Extends: `DataSchema<Item<I, T>>`
- Implements: `Sourceable<Collection<string, I, T>>`

Schema for one complete item (`id` + data) of a `Collection`.

- Built by `Collection` as `Collection.item`. Use that instance, and do not make your own.
- Its `source` is the `Collection`, so `getSource()` can find the collection from the schema (e.g. through `NULLABLE(USERS.item)`).
- `HydratingAPIProvider` writes an endpoint result that uses this schema into its database. A `null` or `undefined` result deletes the item with the `id` from the payload.

## Signatures

```ts
new CollectionItemSchema<I, T>(collection: Collection<string, I, T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `collection` | `Collection<string, I, T>` |  |

## Returns

| Type | Description |
| --- | --- |
| `CollectionItemSchema<I, T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `source` | `Collection<string, I, T>` | The collection this schema validates items of. Read only. |

## Examples

```ts
const GET_USER = GET("/user/{id}", DATA({ id: USERS.id }), NULLABLE(USERS.item));
```
