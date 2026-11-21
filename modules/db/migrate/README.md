# Migrations

Schema migration for SQL-backed database providers. `DBMigrator` and its subclasses compare a provider's live table schema against your `Collection` definitions and emit the SQL statements needed to bring them in sync — creating missing tables, and adding, dropping or changing columns.

## Concepts

### DBMigrator

`DBMigrator` is the abstract base class. It holds a reference to the provider and declares one method: `DBMigrator.migrate()`. Concrete subclasses implement `migrate` to inspect the live schema and run the required SQL.

### SQLMigrator

`SQLMigrator` extends `DBMigrator` with the shared SQL diffing logic. It:

- Calls `getTables()` to list existing tables.
- For each collection, calls `getTable(name)` to read the current column definitions.
- Compares the live columns against the desired columns derived from the collection schema.
- Runs `CREATE TABLE` for new tables, `ALTER TABLE … ADD COLUMN` for new columns, and `ALTER TABLE … DROP COLUMN` for removed columns.

`SQLMigrator` only supports integer (`number` with `step: 1`) and string identifiers. A table has an `id` column, then one column for each top-level prop: the same layout that `SQLProvider` reads and writes. Prop columns allow `NULL`, so a new column needs no default.

### SQLiteMigrator

Targets SQLite and Cloudflare D1. Tables are created with `STRICT` mode. Numbers are `INTEGER` or `REAL`, booleans are `INTEGER`, and JSON props are `TEXT` with a `json_valid()` check. Reads the live schema from `sqlite_master`. A changed column is dropped and added again, so its data is lost.

### PostgresMigrator

Targets PostgreSQL. Types match what Bun's client reads back: `text`, `integer`, `double precision`, `boolean`, and `jsonb` for JSON props. Dates are `text`. String ids get a random UUID default, so `DBProvider.addItem()` works. Reads the live schema from `pg_catalog`. Supports in-place `ALTER COLUMN TYPE` for compatible numeric and string type changes rather than drop-and-add.

## Usage

### Run migrations on startup

```ts
import { SQLiteMigrator } from "shelving/db";
// myProvider is a concrete SQLiteProvider subclass (e.g. from shelving/cloudflare or shelving/bun).
import { myProvider } from "./db";
import { POSTS, COMMENTS } from "./collections";

const migrator = new SQLiteMigrator(myProvider);
await migrator.migrate(POSTS, COMMENTS);
// Creates or alters the "posts" and "comments" tables to match the current schemas.
```

### Inspect migrations without running them

`SQLMigrator.getMigrations()` returns the SQL strings without executing them. Useful for previewing or logging:

```ts
const sql = await migrator.getMigrations(POSTS, COMMENTS);
console.log(sql.join("\n"));
```

### Schema-to-column mapping

Each top-level prop in the collection data schema becomes one column. Arrays, dictionaries and nested `DataSchema` props are JSON columns, and `SQLProvider` reads and writes nested keys (for example `address.city`) inside them.

```ts
import { COLLECTION } from "shelving/db";
import { STRING, NUMBER, BOOLEAN, ARRAY } from "shelving/schema";

const PRODUCTS = COLLECTION("products", STRING, {
	name: STRING,
	price: NUMBER,
	active: BOOLEAN,
	tags: ARRAY(STRING),
});
// SQLite columns: id TEXT PRIMARY KEY, name TEXT, price REAL, active INTEGER, tags TEXT CHECK (json_valid(tags)).
```

### Testing

`testSQLMigrator()` from `shelving/test` checks a migrator against its real database. `bun run cloudflare` runs it for `SQLiteMigrator` on D1, and `bun run postgres` runs it for `PostgresMigrator`.
