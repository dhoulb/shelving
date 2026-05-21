# PostgreSQLProvider

The abstract SQL provider for PostgreSQL. `PostgreSQLProvider` extends [`SQLProvider`](/db/provider/SQLProvider) with PostgreSQL-specific behaviour: the `data` column is `jsonb NOT NULL`, generated columns use the `#>>` operator with a cast, and compatible numeric/string column type changes are applied in place with `ALTER COLUMN TYPE`.

It is abstract — a concrete subclass implements `exec()` against a specific PostgreSQL driver.

## Usage

```ts
import { PostgreSQLProvider } from "shelving/db";

class BunPostgreSQLProvider extends PostgreSQLProvider {
  constructor(private sql: Bun.SQL) { super(); }
  async exec(strings, ...values) {
    return this.sql(strings, ...values);
  }
}
```

Pair it with [`PostgreSQLMigrator`](/db/migrate) to create and alter tables to match your collection schemas. A ready-made provider is available in the [`bun`](/bun) module.

## See also

- [SQLProvider](/db/provider/SQLProvider) — the abstract SQL base.
- [SQLiteProvider](/db/provider/SQLiteProvider) — the SQLite / D1 equivalent.
- [db/migrate](/db/migrate) — `PostgreSQLMigrator` for schema migration.
- [db/provider](/db/provider) — overview of the provider hierarchy.
