# SQLiteProvider

The abstract SQL provider for SQLite and Cloudflare D1. `SQLiteProvider` extends [`SQLProvider`](/db/SQLProvider) with SQLite-specific behaviour: tables are created in `STRICT` mode, the `data` column is `TEXT NOT NULL CHECK (json_valid(data))`, and generated columns use `json_extract`.

It is abstract — a concrete subclass implements `exec()` against a specific SQLite driver.

## Usage

```ts
import { SQLiteProvider } from "shelving/db";

class D1Provider extends SQLiteProvider {
  constructor(private d1: D1Database) { super(); }
  async exec(strings, ...values) {
    return this.d1.prepare(strings.join("?")).bind(...values).all();
  }
}
```

Pair it with [`SQLiteMigrator`](/db/SQLiteMigrator) to create and alter tables to match your collection schemas. A ready-made D1 provider is available in the [`shelving/cloudflare`](/cloudflare) module.
