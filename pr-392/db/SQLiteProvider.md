# SQLiteProvider

- Kind: class
- Import: `import { SQLiteProvider } from "shelving/db";`
- Extends: `SQLProvider<I, T>`

Abstract SQLite provider with JSON1 function support for nested keys, array containment, and array mutations.

Note the following compatibility caveats:
- For `with` and `omit` updates this does not preserve ordering of the original array.
- For `with` and `omit` updates this does not guarantee equality for de-duplication when working with nested objects or arrays.

The abstract SQL provider for SQLite and Cloudflare D1. `SQLiteProvider` extends `SQLProvider` with SQLite-specific behaviour: tables are created in `STRICT` mode, the `data` column is `TEXT NOT NULL CHECK (json_valid(data))`, and generated columns use `json_extract`.

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

Pair it with `SQLiteMigrator` to create and alter tables to match your collection schemas. A ready-made D1 provider is available in the `shelving/cloudflare` module.


## Signatures

```ts
new SQLiteProvider<I, T>()
```

## Returns

| Type | Description |
| --- | --- |
| `SQLiteProvider<I, T>` |  |
