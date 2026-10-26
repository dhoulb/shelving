# shelving/db

- Kind: module
- Import: `import { … } from "shelving/db";`

Typed database provider abstraction. Define your schema once as a `Collection`, then swap providers (in-memory, SQLite, Firestore, Cloudflare D1, …) without changing any call sites. Providers are composable wrappers — add validation, logging, or caching by stacking them in a chain.

## Concepts

### Collection

A `Collection` is a declarative description of a database table or collection. It extends `DataSchema` and carries three things: a string `name`, an `id` schema (the identifier type), and a data schema (the shape of each record).

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
| Single item | `DBProvider.getItem()`, `DBProvider.requireItem()`, `DBProvider.addItem()`, `DBProvider.setItem()`, `DBProvider.updateItem()`, `DBProvider.deleteItem()` |
| Single item (realtime) | `DBProvider.getItemSequence()` |
| Queries | `DBProvider.getQuery()`, `DBProvider.countQuery()`, `DBProvider.setQuery()`, `DBProvider.updateQuery()`, `DBProvider.deleteQuery()`, `DBProvider.getFirst()`, `DBProvider.requireFirst()` |
| Query (realtime) | `DBProvider.getQuerySequence()` |

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

- **`MemoryDBProvider`** — fully in-memory, ideal for testing and as a lightweight standalone store.
- **`ValidationDBProvider`** — validates data in and out using the collection's schema. Throws `ValueError` on bad data from the backend.
- **`ThroughDBProvider`** — identity wrapper; extend this to intercept only specific methods (e.g. `DebugDBProvider`).
- **`SQLiteProvider`** / **`PostgresProvider`** — SQL-backed abstract providers. Concrete subclasses bind them to a specific driver.

Cloud providers live in the `shelving/cloudflare` and `shelving/firebase` sibling modules.

### Migrations

`DBMigrator` is an abstract base for schema migrations. SQL-backed providers ship `SQLiteMigrator` and `PostgresMigrator`, which implement `DBMigrator.migrate()` to create or alter tables to match the current collection schemas.

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

The `shelving/react` module's `createDBContext()` is the primary way to use a provider in a React app. It creates a context that wraps a provider (in a client app, typically a `MemoryDBProvider` that `HydratingAPIProvider` fills) and exposes typed hooks — `DBContext.useItem()` and `DBContext.useQuery()` — that return reactive `Store` instances and suspend automatically while loading.

```ts
import { createDBContext } from "shelving/react"
import { MemoryDBProvider } from "shelving/db"

export const DB = new MemoryDBProvider()
export const { DBContext, useItem, useQuery } = createDBContext(DB)
```

See the `shelving/react` module for full usage.


## Functions

- [COLLECTION()](db/COLLECTION.md): Create a Collection from a name, an identifier schema, and a data schema.
- [replayOperations()](db/replayOperations.md): Replay a list of database operations onto a provider, re-issuing each one in order.

## Classes

- [ItemStore](db/ItemStore.md): Store that fetches and tracks a single item by ID in a collection from a database provider.
- [QueryStore](db/QueryStore.md): Store that runs a query against a collection from a database provider and tracks its matching items.
- [CollectionQuerySchema](db/CollectionQuerySchema.md): Schema for a Query on the items of a Collection.
- [CollectionItemSchema](db/CollectionItemSchema.md): Schema for one complete item (id + data) of a Collection.
- [CollectionItemsSchema](db/CollectionItemsSchema.md): Schema for a list of complete items (id + data) of a Collection.
- [CollectionQueryItemsSchema](db/CollectionQueryItemsSchema.md): Schema for QueryItems of a Collection, i.e. a query and the complete list of items that answer it.
- [Collection](db/Collection.md): Declarative definition of a database collection/table.
- [SQLiteMigrator](db/SQLiteMigrator.md): SQLite (and Cloudflare D1) migrator that uses sqlite_master as the schema source of truth.
- [PostgresMigrator](db/PostgresMigrator.md): PostgreSQL migrator that inspects the live schema via pg_catalog tables to diff and migrate columns.
- [DBMigrator](db/DBMigrator.md): Base class for database schema migrators that bring a provider's storage into line with a set of collection schemas.
- [SQLMigrator](db/SQLMigrator.md): Shared SQL migration logic that diffs collection schemas against live tables to produce migration statements.
- [PostgresProvider](db/PostgresProvider.md): Abstract PostgreSQL provider with JSONB function support for nested keys, array containment, and array mutations.
- [ThroughDBProvider](db/ThroughDBProvider.md): Database provider that passes every core operation straight through to a wrapped source provider.
- [ValidationDBProvider](db/ValidationDBProvider.md): Database provider that validates data flowing to and from an asynchronous source provider.
- [SQLFragment](db/SQLFragment.md): SQL fragment made from template strings plus embedded expressions, ready to be composed into a query.
- [SQLProvider](db/SQLProvider.md): Abstract database provider that implements CRUD and query operations by generating and executing SQL.
- [MockDBProvider](db/MockDBProvider.md): In-memory database provider that records every operation to its calls log, for testing.
- [RecordingDBProvider](db/RecordingDBProvider.md): Database provider that records every operation it performs to its operations log.
- [DebugDBProvider](db/DebugDBProvider.md): Database provider that logs every operation it performs to the console for debugging.
- [MemoryDBProvider](db/MemoryDBProvider.md): Synchronous in-memory database provider, storing each collection in a MemoryTable.
- [MemoryTable](db/MemoryTable.md): In-memory table holding the items of a single collection for a MemoryDBProvider.
- [DBProvider](db/DBProvider.md): Provider with a fully asynchronous interface for database access.
- [SQLiteProvider](db/SQLiteProvider.md): Abstract SQLite provider with JSON1 function support for nested keys, array containment, and array mutations.
- [StorageDBProvider](db/StorageDBProvider.md): In-memory database provider that persists every collection to a Storage — localStorage, sessionStorage, or anything else with the same interface.
- [StorageTable](db/StorageTable.md): MemoryTable that persists its items to a Storage instance — self-contained, so it can also be used independently of StorageDBProvider.
- [UndoDBProvider](db/UndoDBProvider.md): Database provider that records every operation and can undo its own writes.
- [DBCache](db/DBCache.md): Cache of CollectionCache objects for multiple collections.
- [CollectionCache](db/CollectionCache.md): Cache of ItemStore and QueryStore objects for a single collection.

## Types

- [CollectionName](db/CollectionName.md): Extract the string name from a Collection instance.
- [CollectionIdentifier](db/CollectionIdentifier.md): Extract the Identifier type from a Collection instance.
- [CollectionData](db/CollectionData.md): Extract the Data type from a Collection instance.
- [CollectionItem](db/CollectionItem.md): Extract the Item type from a Collection instance.
- [OptionalCollectionItem](db/OptionalCollectionItem.md): Extract the optional (possibly undefined) Item type from a Collection instance.
- [CollectionItems](db/CollectionItems.md): Extract the array of Item types from a Collection instance.
- [Collections](db/Collections.md): A readonly array of Collection instances, optionally narrowed to a standardised Identifier and Data type.
- [CollectionNames](db/CollectionNames.md): Extract the union of string collection names from a Collections type.
- [CollectionsDatabase](db/CollectionsDatabase.md): Convert a Collections array type to a database-style object mapping in { name: data } format.
- [SQLTableColumn](db/SQLTableColumn.md): Column definition in a live SQL table, pairing a column name with its raw definition statement.
- [SQLTable](db/SQLTable.md): Existing SQL table schema keyed by column name, as read back from the database.
- [SQLColumn](db/SQLColumn.md): Generated SQL column mapped from a collection schema path, holding its column name, key, and JSON path.
- [MockDBCall](db/MockDBCall.md): Structured log entry recording one operation performed through a MockDBProvider.
- [DBOperation](db/DBOperation.md): Structured log entry recording a single database operation performed through a RecordingDBProvider.
- [DBOperations](db/DBOperations.md): Readonly array of DBOperation entries, e.g. the log recorded by a RecordingDBProvider.

## Constants

- [ID](db/ID.md): Default identifier schema (integer) used when a collection doesn't supply its own.
