# SQLiteProvider

- Kind: class
- Import: `import { SQLiteProvider } from "shelving/db";`
- Extends: `SQLProvider<I, T>`

Abstract SQLite provider with JSON1 function support for nested keys, array containment, and array mutations.

- SQLite has no boolean or JSON column types. Reads use the collection's schema to turn `0` / `1` back into booleans, and JSON text back into arrays and objects.
- Nested `set` updates bind the value as JSON, so booleans, arrays and objects keep their JSON type inside the column.

- `with` and `omit` updates keep the order of the array. `with` adds new items at the end.

Note: `with` and `omit` updates do not guarantee equality for de-duplication when working with nested objects or arrays.

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


## Signatures

```ts
new SQLiteProvider<I, T>()
```

## Returns

| Type | Description |
| --- | --- |
| `SQLiteProvider<I, T>` |  |
