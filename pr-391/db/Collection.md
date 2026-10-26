# Collection

- Kind: class
- Import: `import { Collection } from "shelving/db";`
- Extends: `DataSchema<T>`

Declarative definition of a database collection/table.

- Pairs a collection name with an identifier schema and a data schema, so providers can validate and address items.
- Extends `DataSchema<T>`, so the collection itself validates an item's data, while `.item` validates the complete `id + data` item.
- `.item`, `.items`, `.query` and `.queryItems` point back at the collection with `source`, so an endpoint result that uses them can hydrate a database (see `HydratingAPIProvider`).

## Signatures

```ts
new Collection<N, I, T>(name: N, id: Schema<I>, data: Schemas<T> | DataSchema<T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `name` | `N` |  |
| `id` | `Schema<I>` |  |
| `data` | `Schemas<T> \| DataSchema<T>` |  |

## Returns

| Type | Description |
| --- | --- |
| `Collection<N, I, T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `name` | `N` | Collection name (used as the table/collection key). Read only. |
| `id` | `Schema<I>` | Schema for the identifier type. Read only. |
| `item` | `CollectionItemSchema<I, T>` | Schema for a complete item (id + data). Read only. |
| `items` | `CollectionItemsSchema<I, T>` | Schema for a list of complete items (id + data). Read only. |
| `query` | `CollectionQuerySchema<I, T>` | Schema for a query on the items. It only checks that the query is an object, so do not trust the query it validates. Read only. |
| `queryItems` | `CollectionQueryItemsSchema<I, T>` | Schema for a query and the complete list of items that answer it. Read only. |

## Examples

```ts
const users = new Collection("users", ID, { name: STRING, age: NUMBER });
 users.validate({ name: "Dave", age: 40 }); // Validates item data.
```
