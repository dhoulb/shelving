# bun

`DBProvider` implementation for PostgreSQL using Bun's built-in `Bun.sql` API. No external database driver is required.

`BunPostgresProvider` extends the shared `PostgresProvider`, which handles SQL generation, filtering, sorting, pagination, JSONB nested key access, and partial updates. The Bun-specific layer provides the tagged-template SQL execution and wraps identifier quoting through Bun's native SQL engine for additional safety.

**Bun only.** This module uses `Bun.sql` and `SQL` from `bun`, which are not available in Node.js or other runtimes.

There is no realtime support — `DBProvider.getItemSequence()` and `DBProvider.getQuerySequence()` throw `UnsupportedError`.

## PostgreSQL (`BunPostgresProvider`)

**Install:**

Bun is the runtime — no extra packages are needed.

**Usage:**

```ts
import { SQL } from "bun";
import { BunPostgresProvider } from "shelving/bun";
import { PostgresMigrator } from "shelving/db";
import { USERS } from "./collections.js";

const sql = new SQL({
  hostname: "localhost",
  port: 5432,
  database: "mydb",
  username: "postgres",
  password: "secret",
});

const provider = new BunPostgresProvider(sql);

// Create or migrate tables from your collection definitions before first use.
const migrator = new PostgresMigrator(provider);
await migrator.migrate(USERS);
```

`new SQL(...)` accepts the same connection options as the Bun PostgreSQL client — see the [Bun SQL docs](https://bun.sh/docs/api/sql) for the full list of options including TLS and connection pooling. You can also pass a connection string as the first argument.

## Transactions

`BunPostgresProvider` supports `DBProvider.transact()` — the callback runs in a `SERIALIZABLE` Postgres transaction on a reserved connection, so every write commits together or not at all:

```ts
await provider.transact(async tx => {
  const from = await tx.requireItem(ACCOUNTS, "alice");
  const to = await tx.requireItem(ACCOUNTS, "bob");
  await tx.updateItem(ACCOUNTS, "alice", { balance: from.balance - 100 });
  await tx.updateItem(ACCOUNTS, "bob", { balance: to.balance + 100 });
});
```

- Returning from the callback commits; throwing rolls back and rethrows.
- When Postgres aborts the transaction for contention (serialization failure `40001` or deadlock `40P01`), the whole callback is retried — up to 5 attempts with jittered exponential backoff — so the callback must have no side effects other than through its provider.
- `SERIALIZABLE` isolation is set explicitly on every transaction, overriding any `default_transaction_isolation` configured on the database, so the `DBProvider.transact()` contract holds regardless of server configuration.
- Nested `transact()` calls throw `UnsupportedError`.

## Testing

The universal `DBProvider` contract suite runs against a real PostgreSQL via its own command (excluded from `bun run test`; run in CI on every PR and release):

```sh
bun run postgres
```

`scripts/postgres.ts` connects to the server at `POSTGRES_URL` (default `postgres://postgres:postgres@127.0.0.1:5432/postgres`), creates a fresh `shelving-test` database and the fixture tables, runs `bun test ./modules/bun`, then drops the database.

Tables must exist before the provider can read or write. `PostgresMigrator.migrate()` inspects the live schema and issues the minimum `CREATE TABLE` or `ALTER TABLE` statements needed to match your collection definitions.
