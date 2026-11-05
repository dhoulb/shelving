# BunPostgresProvider

- Kind: class
- Import: `import { BunPostgresProvider } from "shelving/bun";`
- Extends: `PostgresProvider<I, T>`

PostgreSQL database provider backed by Bun's built-in `Bun.SQL` driver.

Implements the `PostgresProvider` SQL abstraction by executing tagged-template queries against a `Bun.SQL` connection.
- Identifiers are escaped through `Bun.SQL`'s own `sql()` helper rather than naive string quoting, which is more secure.
- Supports transactions via `transact()` — the callback runs in a `SERIALIZABLE` Postgres transaction, and contention aborts are retried automatically.
- Requires the `bun` peer dependency and a running Bun environment.

## Signatures

```ts
new BunPostgresProvider<I, T>(sql: SQL)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `sql` | `SQL` |  |

## Returns

| Type | Description |
| --- | --- |
| `BunPostgresProvider<I, T>` |  |
