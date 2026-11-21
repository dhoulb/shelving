# SQLiteProvider

The abstract SQL provider for SQLite and Cloudflare D1. `SQLiteProvider` extends `SQLProvider` with SQLite-specific behaviour: tables are created in `STRICT` mode, the `data` column is `TEXT NOT NULL CHECK (json_valid(data))`, and generated columns use `json_extract`.

It is abstract — a concrete subclass implements `exec()` against a specific SQLite driver.

## Things to know

- SQLite has no boolean or JSON column types. `SQLiteProvider.getItem()` and `SQLiteProvider.getQuery()` use the collection's schema to turn `0` / `1` back into booleans, and JSON text back into arrays and objects (for `ArraySchema`, `DataSchema` and `DictionarySchema` props).
- Nested keys use bound JSON paths like `'$."sub"."num"'`. A nested `set` binds its value as JSON, so a boolean stays a JSON boolean inside the column.
- `with` updates keep the order of the array and add new items at the end. `omit` updates keep the order of the items that stay.

## Usage

```ts
import { SQLiteProvider } from "shelving/db";

class D1Provider extends SQLiteProvider {
	constructor(private d1: D1Database) {
		super();
	}
	async exec(strings, ...values) {
		return this.d1
			.prepare(strings.join("?"))
			.bind(...values)
			.all();
	}
}
```

Pair it with `SQLiteMigrator` to create and alter tables to match your collection schemas. A ready-made D1 provider is available in the `shelving/cloudflare` module.
