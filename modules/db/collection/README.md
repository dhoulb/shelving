# Collection

`Collection` is the typed definition of a database table. It combines a name, an identifier schema, and a data schema into a single object that every provider method uses as its source of truth for types and validation.

By convention, instantiated collections are constants and use `UPPERCASE`.

## Concepts

### Collection structure

A `Collection<N, I, T>` carries three things:

- `name` — the string key used as the table or collection name in the database.
- `id` — a `Schema<I>` that validates the identifier type. Use `INTEGER` for auto-increment integer IDs, `STRING` for UUIDs, or any other schema.
- The data schema — the shape of each record, defined as a plain object of named schemas. `Collection` extends `DataSchema`, so it validates data directly via `Schema.validate()`.

It also exposes schemas for API results. Each one points back at the collection with `source`, so `HydratingAPIProvider` knows which collection a result belongs to:

| Schema | Validates | Hydrates |
|---|---|---|
| `collection.item` (`CollectionItemSchema`) | One complete item (`id` + data) | Sets the item. `NULLABLE(collection.item)` deletes it on `null`. |
| `collection.items` (`CollectionItemsSchema`) | A list of complete items | Sets each item. |
| `collection.query` (`CollectionQuerySchema`) | A `Query` — only checks that it is an object, so do not trust it | Nothing on its own. |
| `collection.queryItems` (`CollectionQueryItemsSchema`) | `QueryItems`: a query and the complete list of items that answer it | Sets each item, and marks the query as loaded. |

`ARRAY(collection.item)` validates the same value as `collection.items`, but it does not point at the collection, so it does not hydrate.

### The `ID` constant

`ID` is the default integer identifier schema (step 1, safe integer range). Import it when you want an explicit integer ID or when extending a collection.

### Utility types

The module exports helper types to extract typed parts from a `Collection` variable without repetition:

| Type | Extracts |
|---|---|
| `CollectionName<C>` | The string literal name |
| `CollectionIdentifier<C>` | The identifier type `I` |
| `CollectionData<C>` | The data type `T` |
| `CollectionItem<C>` | `Item<I, T>` |
| `OptionalCollectionItem<C>` | `Item<I, T> \| undefined` |
| `CollectionItems<C>` | `readonly Item<I, T>[]` |

## Usage

### Define a collection

```ts
import { COLLECTION } from "shelving/db";
import { STRING, BOOLEAN, INTEGER } from "shelving/schema";

// String (UUID) identifiers.
const POSTS = COLLECTION("posts", STRING, {
  title:     STRING,
  body:      STRING,
  published: BOOLEAN,
});

// Auto-increment integer identifiers.
const COMMENTS = COLLECTION("comments", INTEGER, {
  postId:  INTEGER,
  message: STRING,
});
```

### Validate data directly

Because `Collection` extends `DataSchema`, you can call `.validate()` on it:

```ts
const clean = POSTS.validate({ title: "Hi", body: "World", published: false });
// { title: "Hi", body: "World", published: false }

POSTS.validate({ title: "" });
// throws "title: Required"
```

### Extract types

```ts
import type { CollectionItem, CollectionData } from "shelving/db";

type Post = CollectionData<typeof POSTS>;      // { title: string; body: string; published: boolean }
type PostItem = CollectionItem<typeof POSTS>;  // { id: string; title: string; body: string; published: boolean }
```
