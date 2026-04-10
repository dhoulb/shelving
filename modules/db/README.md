# db

Typed database provider abstraction. Define your schema once as a [`Collection`](../schema/README.md), then swap providers (in-memory, SQLite, Firestore, Cloudflare D1, …) without changing any call sites. Providers are composable wrappers — add validation, logging, or caching by stacking them in a chain.

## Concepts

### Collection

A `Collection` is a declarative description of a database table or collection. It extends [`DataSchema`](../schema/README.md) and carries three things: a string `name`, an `id` schema (the identifier type), and a data schema (the shape of each record).

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

`DBProvider` is the abstract base class every backend implements. Its surface covers:

| Category | Methods |
|---|---|
| Single item | `getItem`, `requireItem`, `addItem`, `setItem`, `updateItem`, `deleteItem` |
| Single item (realtime) | `getItemSequence` |
| Queries | `getQuery`, `countQuery`, `setQuery`, `updateQuery`, `deleteQuery`, `getFirst`, `requireFirst` |
| Query (realtime) | `getQuerySequence` |

`getItemSequence` and `getQuerySequence` return `AsyncIterable` — iterate them with `for await...of` to receive realtime updates as data changes.

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

- **`MemoryDBProvider`** — fully in-memory, ideal for testing and as a lightweight standalone store.
- **`ValidationDBProvider`** — validates data in and out using the collection's schema. Throws `ValueError` on bad data from the backend.
- **`CacheDBProvider`** — keeps a `MemoryDBProvider` mirror in sync with a remote source so reads are synchronous after the first fetch. Primarily useful with the [React integration](#react-integration).
- **`ThroughDBProvider`** — identity wrapper; extend this to intercept only specific methods (e.g. `DebugDBProvider`).
- **`SQLiteProvider`** / **`PostgreSQLProvider`** — SQL-backed abstract providers. Concrete subclasses bind them to a specific driver.

Cloud providers live in the [`cloudflare`](../cloudflare/README.md) and [`firestore`](../firestore/README.md) sibling modules.

### Migrations

`DBMigrator` is an abstract base for schema migrations. SQL-backed providers ship `SQLiteMigrator` and `PostgreSQLMigrator`, which implement `migrate(...collections)` to create or alter tables to match the current collection schemas.

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

The [`react`](../react/README.md) module's `createDBContext()` is the primary way to use a provider in a React app. It creates a context that wraps a provider (typically with a `CacheDBProvider` in the chain) and exposes typed hooks — `useItem()`, `useQuery()`, `useProvider()` — that return reactive `Store` instances and suspend automatically while loading.

```ts
import { createDBContext } from "shelving/react"
import { CacheDBProvider, ValidationDBProvider, MemoryDBProvider } from "shelving/db"

const provider = new CacheDBProvider(new ValidationDBProvider(new MemoryDBProvider()))
export const { DBContext, useItem, useQuery } = createDBContext(provider)
```

See the [`react`](../react/README.md) module for full usage.

## See also

- [`schema`](../schema/README.md) — `DataSchema` that `Collection` extends
- [`store`](../store/README.md) — `Store` base class used by `ItemStore` and `QueryStore`
- [`react`](../react/README.md) — `createDBContext()` for React integration
- [`cloudflare`](../cloudflare/README.md) — Cloudflare KV and D1 providers
- [`firestore`](../firestore/README.md) — Firestore providers
