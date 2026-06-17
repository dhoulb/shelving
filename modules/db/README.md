# db

Typed database provider abstraction. Define your schema once as a [`Collection`](/db/Collection), then swap providers (in-memory, SQLite, Firestore, Cloudflare D1, …) without changing any call sites. Providers are composable wrappers — add validation, logging, or caching by stacking them in a chain.

## Concepts

### Collection

A [`Collection`](/db/Collection) is a declarative description of a database table or collection. It extends [`DataSchema`](/schema/DataSchema) and carries three things: a string `name`, an `id` schema (the identifier type), and a data schema (the shape of each record).

```ts
import { COLLECTION } from "shelving/db"
import { STRING, BOOLEAN } from "shelving/schema"

const POSTS = COLLECTION("posts", STRING, {
  title:     STRING,
  body:      STRING,
  published: BOOLEAN,
})
```

`Collection` is the single source of truth for both runtime validation and TypeScript types. All provider methods are generic over the collection so the compiler tracks `id` and `data` types automatically.

### DBProvider

[`DBProvider`](/db/DBProvider) is the abstract base class every backend implements. Its surface covers:

| Category | Methods |
|---|---|
| Single item | [`.getItem()`](/db/DBProvider/getItem), [`.requireItem()`](/db/DBProvider/requireItem), [`.addItem()`](/db/DBProvider/addItem), [`.setItem()`](/db/DBProvider/setItem), [`.updateItem()`](/db/DBProvider/updateItem), [`.deleteItem()`](/db/DBProvider/deleteItem) |
| Single item (realtime) | [`.getItemSequence()`](/db/DBProvider/getItemSequence) |
| Queries | [`.getQuery()`](/db/DBProvider/getQuery), [`.countQuery()`](/db/DBProvider/countQuery), [`.setQuery()`](/db/DBProvider/setQuery), [`.updateQuery()`](/db/DBProvider/updateQuery), [`.deleteQuery()`](/db/DBProvider/deleteQuery), [`.getFirst()`](/db/DBProvider/getFirst), [`.requireFirst()`](/db/DBProvider/requireFirst) |
| Query (realtime) | [`.getQuerySequence()`](/db/DBProvider/getQuerySequence) |

`.getItemSequence()` and `.getQuerySequence()` return `AsyncIterable` — iterate them with `for await...of` to receive realtime updates as data changes.

### Query syntax

Query objects use encoded key names alongside plain field names:

```ts
{ status: "active" }        // equality
{ "!status": "banned" }     // not-equal  (!key)
{ "count>": 10 }            // greater-than (key>)
{ "tags[]": "typescript" }  // array-contains (key[])
{ $order: "name" }          // order by field
{ $limit: 20 }              // page size
```

### Provider composition

Providers are layered wrappers. Each takes a `source` and delegates to it, intercepting only what it needs.

- **[`MemoryDBProvider`](/db/MemoryDBProvider)** — fully in-memory, ideal for testing and as a lightweight standalone store.
- **[`ValidationDBProvider`](/db/ValidationDBProvider)** — validates data in and out using the collection's schema. Throws [`ValueError`](/error/ValueError) on bad data from the backend.
- **[`CacheDBProvider`](/db/CacheDBProvider)** — keeps a `MemoryDBProvider` mirror in sync with a remote source so reads are synchronous after the first fetch. Primarily useful with the [React integration](#react-integration).
- **[`ThroughDBProvider`](/db/ThroughDBProvider)** — identity wrapper; extend this to intercept only specific methods (e.g. [`DebugDBProvider`](/db/DebugDBProvider)).
- **[`SQLiteProvider`](/db/SQLiteProvider)** / **[`PostgreSQLProvider`](/db/PostgreSQLProvider)** — SQL-backed abstract providers. Concrete subclasses bind them to a specific driver.

Cloud providers live in the [`cloudflare`](/cloudflare) and [`firestore`](/firestore/client) sibling modules.

### Migrations

[`DBMigrator`](/db/DBMigrator) is an abstract base for schema migrations. SQL-backed providers ship [`SQLiteMigrator`](/db/SQLiteMigrator) and [`PostgreSQLMigrator`](/db/PostgreSQLMigrator), which implement [`.migrate()`](/db/DBMigrator/migrate) to create or alter tables to match the current collection schemas.

## Usage

### Define a collection and build a provider chain

```ts
import { COLLECTION, MemoryDBProvider, ValidationDBProvider } from "shelving/db"
import { STRING, BOOLEAN } from "shelving/schema"

const POSTS = COLLECTION("posts", STRING, {
  title:     STRING,
  body:      STRING,
  published: BOOLEAN,
})

// In production replace MemoryDBProvider with a real backend (Firestore, D1, …).
const provider = new ValidationDBProvider(new MemoryDBProvider())
```

### Read and write items

```ts
// Add a new item — returns the generated id.
const id = await provider.addItem(POSTS, { title: "Hello world", body: "First post.", published: false })

// Read it back.
const post = await provider.getItem(POSTS, id)

// Partial update.
await provider.updateItem(POSTS, id, { published: true })

// Delete.
await provider.deleteItem(POSTS, id)
```

### Query items

```ts
const posts = await provider.getQuery(POSTS, {
  published: true,
  $order: "title",
  $limit: 10,
})
```

### Realtime subscriptions

```ts
for await (const post of provider.getItemSequence(POSTS, id)) {
  console.log(post) // emits whenever this item changes
}
```

## React integration

The [`react`](/react) module's [`createDBContext()`](/react/createDBContext) is the primary way to use a provider in a React app. It creates a context that wraps a provider (typically with a `CacheDBProvider` in the chain) and exposes typed hooks — [`.useItem()`](/react/DBContext/useItem) and [`.useQuery()`](/react/DBContext/useQuery) — that return reactive [`Store`](/store/Store) instances and suspend automatically while loading.

```ts
import { createDBContext } from "shelving/react"
import { CacheDBProvider, ValidationDBProvider, MemoryDBProvider } from "shelving/db"

const provider = new CacheDBProvider(new ValidationDBProvider(new MemoryDBProvider()))
export const { DBContext, useItem, useQuery } = createDBContext(provider)
```

See the [`react`](/react) module for full usage.

## See also

- [`schema`](/schema) — [`DataSchema`](/schema/DataSchema) that [`Collection`](/db/Collection) extends
- [`store`](/store) — [`Store`](/store/Store) base class used by [`ItemStore`](/db/ItemStore) and [`QueryStore`](/db/QueryStore)
- [`react`](/react) — [`createDBContext()`](/react/createDBContext) for React integration
- [`cloudflare`](/cloudflare) — Cloudflare KV and D1 providers
- [`firestore`](/firestore/client) — Firestore providers
