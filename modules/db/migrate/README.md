# Migrations

Schema migration for SQL-backed database providers. `DBMigrator` and its subclasses compare a provider's live table schema against your `Collection` definitions and emit the SQL statements needed to bring them in sync — creating missing tables and adding or dropping generated columns.

## Concepts

### DBMigrator

`DBMigrator` is the abstract base class. It holds a reference to the provider and declares one method: `DBMigrator.migrate()`. Concrete subclasses implement `migrate` to inspect the live schema and run the required SQL.

### SQLMigrator

`SQLMigrator` extends `DBMigrator` with the shared SQL diffing logic. It:

- Calls `getTables()` to list existing tables.
- For each collection, calls `getTable(name)` to read the current column definitions.
- Compares the live columns against the desired columns derived from the collection schema.
- Runs `CREATE TABLE` for new tables, `ALTER TABLE … ADD COLUMN` for new columns, and `ALTER TABLE … DROP COLUMN` for removed columns.

`SQLMigrator` only supports integer (`number` with `step: 1`) and string identifiers. Each scalar field in the collection schema maps to a **generated column** extracted from the `data` JSON blob, so queries can use indexed column comparisons.

### SQLiteMigrator

Targets SQLite and Cloudflare D1. Tables are created with `STRICT` mode. The `data` column is `TEXT NOT NULL CHECK (json_valid(data))`. Generated columns use `json_extract`. Reads the live schema from `sqlite_master`.

### PostgreSQLMigrator

Targets PostgreSQL. The `data` column is `jsonb NOT NULL`. Generated columns use the `#>>` operator with a cast. Reads the live schema from `pg_catalog`. Supports in-place `ALTER COLUMN TYPE` for compatible numeric and string type changes rather than drop-and-add.

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

Each scalar field in the collection data schema becomes a generated column. Nested `DataSchema` props are flattened with `__` separators (e.g. `address.city` → `address__city`). Arrays, dictionaries, and nested objects are stored only in `data` and are not individually indexed.

```ts
import { COLLECTION } from "shelving/db";
import { STRING, NUMBER, BOOLEAN, ARRAY } from "shelving/schema";

const PRODUCTS = COLLECTION("products", STRING, {
  name:   STRING,
  price:  NUMBER,
  active: BOOLEAN,
  // Arrays stay in data — no generated column created for them.
  tags:   ARRAY(STRING),
});
// Generated columns: name TEXT, price REAL, active INTEGER (all extracted from data JSON).
```
