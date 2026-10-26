# CollectionQuerySchema

- Kind: class
- Import: `import { CollectionQuerySchema } from "shelving/db";`
- Extends: `Schema<Query<Item<I, T>>>`
- Implements: `Sourceable<Collection<string, I, T>>`

Schema for a `Query` on the items of a `Collection`.

- Built by `Collection` as `Collection.query`. Use that instance, and do not make your own.
- **Do not trust a query that this schema validates.** It only checks that the value is an object. It does not check the keys or the values against the collection, so a query from outside (e.g. an API response) can have any keys and values.
- Its `source` is the `Collection`, so `getSource()` can find the collection from the schema.

## Signatures

```ts
new CollectionQuerySchema<I, T>(collection: Collection<string, I, T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `collection` | `Collection<string, I, T>` |  |

## Returns

| Type | Description |
| --- | --- |
| `CollectionQuerySchema<I, T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `source` | `Collection<string, I, T>` | The collection this schema validates queries for. Read only. |
