# SQLProvider

The abstract SQL base provider. `SQLProvider` implements the `DBProvider` surface in terms of SQL, leaving one method for concrete subclasses to provide: `exec<X>(strings, ...values)`, which runs a parameterised query and returns rows as plain objects.

Each scalar field in a collection schema maps to a **generated column** extracted from the `data` JSON blob, so queries use indexed column comparisons. `SQLProvider` supports integer (`number` with `step: 1`) and string identifiers. Realtime sequences are not supported — `getItemSequence` / `getQuerySequence` throw `UnimplementedError`.

## Usage

`SQLProvider` is abstract — bind it to a driver by implementing `exec()`. The built-in [`SQLiteProvider`](/db/provider/SQLiteProvider) and [`PostgreSQLProvider`](/db/provider/PostgreSQLProvider) extend it with dialect-specific JSON path syntax; concrete drivers live in the [`cloudflare`](/cloudflare) and [`bun`](/bun) modules.

```ts
import { SQLiteProvider } from "shelving/db";

// A concrete subclass implements exec() against a specific driver.
class D1Provider extends SQLiteProvider {
  async exec(strings, ...values) {
    return this.db.prepare(strings.join("?")).bind(...values).all();
  }
}
```

## See also

- [SQLiteProvider](/db/provider/SQLiteProvider) — SQLite / D1 dialect.
- [PostgreSQLProvider](/db/provider/PostgreSQLProvider) — PostgreSQL dialect.
- [db/migrate](/db/migrate) — migrators that create the generated-column tables.
- [db/provider](/db/provider) — overview of the provider hierarchy.
