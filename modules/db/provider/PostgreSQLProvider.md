# PostgreSQLProvider

The abstract SQL provider for PostgreSQL. `PostgreSQLProvider` extends [`SQLProvider`](/db/SQLProvider) with PostgreSQL-specific behaviour: the `data` column is `jsonb NOT NULL`, generated columns use the `#>>` operator with a cast, and compatible numeric/string column type changes are applied in place with `ALTER COLUMN TYPE`.

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

Pair it with [`PostgreSQLMigrator`](/db/PostgreSQLMigrator) to create and alter tables to match your collection schemas. A ready-made provider is available in the [`shelving/bun`](/bun) module.

## See also

- [`SQLProvider`](/db/SQLProvider) — the abstract SQL base.
- [`SQLiteProvider`](/db/SQLiteProvider) — the SQLite / D1 equivalent.
- [`shelving/db`](/db) — `PostgreSQLMigrator` for schema migration.
- [`shelving/db`](/db) — overview of the provider hierarchy.
