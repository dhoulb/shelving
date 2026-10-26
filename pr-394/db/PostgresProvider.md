# PostgresProvider

- Kind: class
- Import: `import { PostgresProvider } from "shelving/db";`
- Extends: `SQLProvider<I, T>`

Abstract PostgreSQL provider with JSONB function support for nested keys, array containment, and array mutations.

The abstract SQL provider for PostgreSQL. `PostgresProvider` extends `SQLProvider` with PostgreSQL-specific behaviour: the `data` column is `jsonb NOT NULL`, generated columns use the `#>>` operator with a cast, and compatible numeric/string column type changes are applied in place with `ALTER COLUMN TYPE`.

It is abstract — a concrete subclass implements `exec()` against a specific PostgreSQL driver.

## Usage

```ts
import { PostgresProvider } from "shelving/db";

class BunPostgresProvider extends PostgresProvider {
  constructor(private sql: Bun.SQL) { super(); }
  async exec(strings, ...values) {
    return this.sql(strings, ...values);
  }
}
```

Pair it with `PostgresMigrator` to create and alter tables to match your collection schemas. A ready-made provider is available in the `shelving/bun` module.


## Signatures

```ts
new PostgresProvider<I, T>()
```

## Returns

| Type | Description |
| --- | --- |
| `PostgresProvider<I, T>` |  |
