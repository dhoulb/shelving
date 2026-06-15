# Collection

[`Collection`](/db/Collection) is the typed definition of a database table. It combines a name, an identifier schema, and a data schema into a single object that every provider method uses as its source of truth for types and validation.

By convention, instantiated collections are constants and use `UPPERCASE`.

## Concepts

### Collection structure

A `Collection<N, I, T>` carries three things:

- `name` — the string key used as the table or collection name in the database.
- `id` — a [`Schema`](/schema/Schema)`<I>` that validates the identifier type. Use [`INTEGER`](/schema/INTEGER) for auto-increment integer IDs, [`STRING`](/schema/STRING) for UUIDs, or any other schema.
- The data schema — the shape of each record, defined as a plain object of named schemas. `Collection` extends [`DataSchema`](/schema/DataSchema), so it validates data directly via [`.validate()`](/schema/Schema/validate).

It also exposes `collection.item`, a combined `DataSchema<{ id: I } & T>` used by providers to validate complete items returned from the backend.

### The `ID` constant

[`ID`](/db/ID) is the default integer identifier schema (step 1, safe integer range). Import it when you want an explicit integer ID or when extending a collection.

### Utility types

The module exports helper types to extract typed parts from a `Collection` variable without repetition:

| Type | Extracts |
|---|---|
| [`CollectionName`](/db/CollectionName)`<C>` | The string literal name |
| [`CollectionIdentifier`](/db/CollectionIdentifier)`<C>` | The identifier type `I` |
| [`CollectionData`](/db/CollectionData)`<C>` | The data type `T` |
| [`CollectionItem`](/db/CollectionItem)`<C>` | [`Item`](/util/item/Item)`<I, T>` |
| [`OptionalCollectionItem`](/db/OptionalCollectionItem)`<C>` | `Item<I, T> \| undefined` |
| [`CollectionItems`](/db/CollectionItems)`<C>` | `readonly Item<I, T>[]` |

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

## See also

- [`db`](/db) — provider methods all accept a `Collection` as their first argument
- [`schema`](/schema) — [`DataSchema`](/schema/DataSchema) that `Collection` extends; [`ITEM()`](/schema/ITEM) that builds `collection.item`
- [`db`](/db) — [`DBProvider`](/db/DBProvider) and the built-in provider implementations
- [`db`](/db) — [`SQLiteMigrator`](/db/SQLiteMigrator) and [`PostgreSQLMigrator`](/db/PostgreSQLMigrator) use collection schemas to create and alter tables
