# PostgresProvider

The abstract SQL provider for PostgreSQL. `PostgresProvider` extends `SQLProvider` with PostgreSQL-specific behaviour: `jsonb` operators for nested keys, array filters and array updates. Use `PostgresMigrator` to make the tables.

It is abstract — a concrete subclass implements `exec()` against a specific PostgreSQL driver.

Nested keys such as `sub.num` work in filters, orders and updates. The path binds as a `text[]` value and the compared or written value binds as `jsonb`, so nested numbers compare and sort as numbers.

## Usage

```ts
import { PostgresProvider } from "shelving/db";

class BunPostgresProvider extends PostgresProvider {
	constructor(private sql: Bun.SQL) {
		super();
	}
	async exec(strings, ...values) {
		return this.sql(strings, ...values);
	}
}
```

Pair it with `PostgresMigrator` to create and alter tables to match your collection schemas. A ready-made provider is available in the `shelving/bun` module.
