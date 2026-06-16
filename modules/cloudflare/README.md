# cloudflare

[`DBProvider`](/db/DBProvider) implementations for Cloudflare Workers. Two backends are available: Workers KV for simple key-value storage and D1 for relational SQL.

Both providers accept a binding object injected by the Cloudflare Workers runtime. Declare the binding in `wrangler.toml` and access it through the `env` parameter of your Worker's `fetch` handler.

## KV ([`CloudflareKVProvider`](/cloudflare/CloudflareKVProvider))

Workers KV is a globally distributed key-value store. It is the right choice when you need fast single-item reads and writes by ID across Cloudflare's edge network, and do not need to query or filter across items.

Items are stored as JSON under keys formatted as `collection:id`. [`.addItem()`](/db/DBProvider/addItem) generates a UUID v4 identifier automatically.

**Limitations:**

- No queries — [`.getQuery()`](/db/DBProvider/getQuery), [`.setQuery()`](/db/DBProvider/setQuery), [`.deleteQuery()`](/db/DBProvider/deleteQuery), and [`.countQuery()`](/db/DBProvider/countQuery) throw [`UnimplementedError`](/error/UnimplementedError).
- No partial updates — [`.updateItem()`](/db/DBProvider/updateItem) and [`.updateQuery()`](/db/DBProvider/updateQuery) throw `UnimplementedError`.
- No realtime — [`.getItemSequence()`](/db/DBProvider/getItemSequence) and [`.getQuerySequence()`](/db/DBProvider/getQuerySequence) throw `UnimplementedError`.
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

## D1 ([`CloudflareD1Provider`](/cloudflare/CloudflareD1Provider))

D1 is Cloudflare's edge SQLite database. It supports collection queries with filtering, sorting, and pagination. Use it when you need structured data and the ability to query across items.

`CloudflareD1Provider` extends the shared [`SQLiteProvider`](/db/SQLiteProvider), so it inherits standard SQL-based CRUD and query behaviour. There is no realtime support — [`.getItemSequence()`](/db/DBProvider/getItemSequence) and [`.getQuerySequence()`](/db/DBProvider/getQuerySequence) throw [`UnimplementedError`](/error/UnimplementedError).

Tables must exist before the provider can read or write. Use [`SQLiteMigrator`](/db/SQLiteMigrator) from `shelving/db` to create and migrate tables from your collection definitions.

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
