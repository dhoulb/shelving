# bun

[DBProvider](../db/README.md) implementation for PostgreSQL using Bun's built-in `Bun.sql` API. No external database driver is required.

`BunPostgreSQLProvider` extends the shared `PostgreSQLProvider`, which handles SQL generation, filtering, sorting, pagination, JSONB nested key access, and partial updates. The Bun-specific layer provides the tagged-template SQL execution and wraps identifier quoting through Bun's native SQL engine for additional safety.

**Bun only.** This module uses `Bun.sql` and `SQL` from `bun`, which are not available in Node.js or other runtimes.

There is no realtime support — `getItemSequence()` and `getQuerySequence()` throw `UnimplementedError`.

## PostgreSQL (`BunPostgreSQLProvider`)

**Install:**

Bun is the runtime — no extra packages are needed.

**Usage:**

```ts
import { SQL } from "bun";
import { BunPostgreSQLProvider } from "shelving/bun";
import { PostgreSQLMigrator } from "shelving/db";
import { USERS } from "./collections.js";

const sql = new SQL({
  hostname: "localhost",
  port: 5432,
  database: "mydb",
  username: "postgres",
  password: "secret",
});

const provider = new BunPostgreSQLProvider(sql);

// Create or migrate tables from your collection definitions before first use.
const migrator = new PostgreSQLMigrator(provider);
await migrator.migrate(USERS);
```

`new SQL(...)` accepts the same connection options as the Bun PostgreSQL client — see the [Bun SQL docs](https://bun.sh/docs/api/sql) for the full list of options including TLS and connection pooling. You can also pass a connection string as the first argument.

Tables must exist before the provider can read or write. `PostgreSQLMigrator.migrate()` inspects the live schema and issues the minimum `CREATE TABLE` or `ALTER TABLE` statements needed to match your collection definitions.
