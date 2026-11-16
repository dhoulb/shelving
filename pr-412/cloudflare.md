# shelving/cloudflare

- Kind: module
- Import: `import { … } from "shelving/cloudflare";`

`DBProvider` implementations for Cloudflare Workers. Two backends are available: Workers KV for simple key-value storage and D1 for relational SQL.

Both providers accept a binding object injected by the Cloudflare Workers runtime. Declare the binding in `wrangler.toml` and access it through the `env` parameter of your Worker's `fetch` handler.

## KV (`CloudflareKVProvider`)

Workers KV is a globally distributed key-value store. It is the right choice when you need fast single-item reads and writes by ID across Cloudflare's edge network, and do not need to query or filter across items.

Items are stored as JSON under keys formatted as `collection:id`. `DBProvider.addItem()` generates a UUID v4 identifier automatically.

**Limitations:**

- No queries — `DBProvider.getQuery()`, `DBProvider.setQuery()`, `DBProvider.deleteQuery()`, and `DBProvider.countQuery()` throw `UnsupportedError`.
- No partial updates — `DBProvider.updateItem()` and `DBProvider.updateQuery()` throw `UnsupportedError`.
- No realtime — `DBProvider.getItemSequence()` and `DBProvider.getQuerySequence()` throw `UnsupportedError`.
- Eventual consistency — reads may briefly return stale data after a write.

**Install:**

```sh
npm install shelving
```

```wrangler.toml
[[kv_namespaces]]
binding = "MY_KV"
id = "your-kv-namespace-id"
```

```worker.ts
import { CloudflareKVProvider } from "shelving/cloudflare";

export default {
  async fetch(request: Request, env: Env) {
    const provider = new CloudflareKVProvider(env.MY_KV);
    // use provider with a Collection
  },
};
```

## D1 (`CloudflareD1Provider`)

D1 is Cloudflare's edge SQLite database. It supports collection queries with filtering, sorting, and pagination. Use it when you need structured data and the ability to query across items.

`CloudflareD1Provider` extends the shared `SQLiteProvider`, so it inherits standard SQL-based CRUD and query behaviour. There is no realtime support — `DBProvider.getItemSequence()` and `DBProvider.getQuerySequence()` throw `UnsupportedError`.

Tables must exist before the provider can read or write. Use `SQLiteMigrator` from `shelving/db` to create and migrate tables from your collection definitions.

```wrangler.toml
[[d1_databases]]
binding = "MY_DB"
database_name = "my-database"
database_id = "your-d1-database-id"
```

```worker.ts
import { CloudflareD1Provider } from "shelving/cloudflare";
import { SQLiteMigrator } from "shelving/db";
import { USERS } from "./collections.js";

export default {
  async fetch(request: Request, env: Env) {
    const provider = new CloudflareD1Provider(env.MY_DB);

    // Create or migrate tables on first run (or in a setup script).
    const migrator = new SQLiteMigrator(provider);
    await migrator.migrate(USERS);

    // use provider with a Collection
  },
};
```


## Classes

- [CloudflareD1Provider](cloudflare/CloudflareD1Provider.md): SQLite database provider backed by Cloudflare D1.
- [CloudflareKVProvider](cloudflare/CloudflareKVProvider.md): Cloudflare Workers KV database provider.

## Interfaces

- [KVNamespace](cloudflare/KVNamespace.md): Minimal interface matching the Cloudflare Workers KV namespace runtime object.
- [D1Meta](cloudflare/D1Meta.md): Metadata returned by the D1 Worker API alongside a query result.
- [D1Result](cloudflare/D1Result.md): Result object returned by D1PreparedStatement.run().
- [D1ExecResult](cloudflare/D1ExecResult.md): Result object returned by D1Database.exec().
- [D1PreparedStatement](cloudflare/D1PreparedStatement.md): Minimal prepared statement interface for D1 databases and sessions.
- [D1Database](cloudflare/D1Database.md): Minimal D1 binding/session interface used by CloudflareD1Provider.

## Types

- [D1Value](cloudflare/D1Value.md): Value that can be passed through the D1 Worker API as a bound parameter.
