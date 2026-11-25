# SQLMigrator

- Kind: class
- Import: `import { SQLMigrator } from "shelving/db";`
- Extends: `DBMigrator<T>`

Shared SQL migration logic that diffs collection schemas against live tables to produce migration statements.

- A table has an `id` column, then one column for each top-level prop, the same layout that `SQLProvider` reads and writes.
- Scalar props get a typed column. Arrays, dictionaries and nested data get a JSON column.
- Prop columns allow `NULL`, so a column added to an existing table needs no default.
- Subclasses implement backend-specific schema inspection and column definitions (e.g. SQLite, PostgreSQL).

## Signatures

```ts
new SQLMigrator<T>()
```

## Returns

| Type | Description |
| --- | --- |
| `SQLMigrator<T>` |  |

## Methods

- [SQLMigrator.migrate()](SQLMigrator/migrate.md): Run each statement from getMigrations() against the provider in order.
- [SQLMigrator.getMigrations()](SQLMigrator/getMigrations.md): Compute the SQL statements needed to bring the tables into line with the given collection schemas, without executing them.
- [SQLMigrator.getCreateTableQuery()](SQLMigrator/getCreateTableQuery.md): Build the CREATE TABLE statement for a collection, with its id column and one column for each top-level prop.
- [SQLMigrator.getCreateTableColumns()](SQLMigrator/getCreateTableColumns.md): Get the full set of columns for a collection's table: the id column, then one column for each top-level prop.
