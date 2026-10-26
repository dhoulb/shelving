# SQLMigrator

- Kind: class
- Import: `import { SQLMigrator } from "shelving/db";`
- Extends: `DBMigrator<T>`

Shared SQL migration logic that diffs collection schemas against live tables to produce migration statements.

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

- [migrate](SQLMigrator/migrate.md): Run each statement from getMigrations() against the provider in order.
- [getMigrations](SQLMigrator/getMigrations.md): Compute the SQL statements needed to bring the tables into line with the given collection schemas, without executing them.
- [getCreateTableQuery](SQLMigrator/getCreateTableQuery.md): Build the CREATE TABLE statement for a collection, including its ID, data, and generated columns.
- [getCreateTableColumns](SQLMigrator/getCreateTableColumns.md): Get the full set of columns for a collection's table: the ID column, data column, and generated columns.
- [getGeneratedTableColumns](SQLMigrator/getGeneratedTableColumns.md): Get the generated (computed) columns for a collection's table, derived from its schema's scalar properties.
