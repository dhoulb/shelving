# SQLProvider

- Kind: class
- Import: `import { SQLProvider } from "shelving/db";`
- Extends: `DBProvider<I, T>`

Abstract database provider that implements CRUD and query operations by generating and executing SQL.

- Subclasses implement `exec()` to run a query against a concrete database (e.g. SQLite, PostgreSQL).
- The `sql*` helpers build composable `SQLFragment` objects so dialect differences can be overridden.
- Realtime subscriptions are unsupported and throw `UnsupportedError`.

The abstract SQL base provider. `SQLProvider` implements the `DBProvider` surface in terms of SQL, leaving one method for concrete subclasses to provide: `exec<X>(strings, ...values)`, which runs a parameterised query and returns rows as plain objects.

Each scalar field in a collection schema maps to a **generated column** extracted from the `data` JSON blob, so queries use indexed column comparisons. `SQLProvider` supports integer (`number` with `step: 1`) and string identifiers. Realtime sequences are not supported — `getItemSequence` / `getQuerySequence` throw `UnsupportedError`.

## Usage

`SQLProvider` is abstract — bind it to a driver by implementing `exec()`. The built-in `SQLiteProvider` and `PostgresProvider` extend it with dialect-specific JSON path syntax; concrete drivers live in the `shelving/cloudflare` and `shelving/bun` modules.

```ts
import { SQLiteProvider } from "shelving/db";

// A concrete subclass implements exec() against a specific driver.
class D1Provider extends SQLiteProvider {
  async exec(strings, ...values) {
    return this.db.prepare(strings.join("?")).bind(...values).all();
  }
}
```


## Signatures

```ts
new SQLProvider<I, T>()
```

## Returns

| Type | Description |
| --- | --- |
| `SQLProvider<I, T>` |  |

## Methods

- [SQLProvider.exec()](SQLProvider/exec.md): Execute an SQL query built from a template literal and return the resulting rows.
- [SQLProvider.sql()](SQLProvider/sql.md): Define an SQL fragment using Javascript template literal format.
- [SQLProvider.sqlIdentifier()](SQLProvider/sqlIdentifier.md): Define an SQL fragment for an escaped identifier, e.g. "myTable".
- [SQLProvider.sqlExtract()](SQLProvider/sqlExtract.md): Define an SQL fragment that extracts a value at a key for comparison, e.g. "a" #>> {"b","c"} in Postgres.
- [SQLProvider.sqlConcat()](SQLProvider/sqlConcat.md): Define an SQL fragment that joins a series of fragments with a separator, e.g. "a" = 1 AND "b" = 2.
- [SQLProvider.sqlSetters()](SQLProvider/sqlSetters.md): Define an SQL fragment for setting a list of values, e.g. "a" = 1, "b" = 2.
- [SQLProvider.sqlUpdates()](SQLProvider/sqlUpdates.md): Define an SQL fragment for a set of updates, e.g. "a" = 1, "b" = "b" + 5.
- [SQLProvider.sqlUpdate()](SQLProvider/sqlUpdate.md): Define an SQL fragment for a single update action.
- [SQLProvider.sqlValues()](SQLProvider/sqlValues.md): Define an SQL fragment for VALUES syntax, e.g. ("a", "b") VALUES (1, 2).
- [SQLProvider.sqlClauses()](SQLProvider/sqlClauses.md): Define an SQL fragment for the WHERE, ORDER BY and LIMIT clauses of a query, e.g. WHERE x = 1 ORDER BY "name" LIMIT 0, 50.
- [SQLProvider.sqlWhere()](SQLProvider/sqlWhere.md): Define an SQL fragment for a WHERE clause, e.g. WHERE x = 1 AND y <= 100.
- [SQLProvider.sqlFilter()](SQLProvider/sqlFilter.md): Define an SQL fragment for a single filter clause on a column, e.g. x = 1 or x IN (1, 2).
- [SQLProvider.sqlOrder()](SQLProvider/sqlOrder.md): Define an SQL fragment for an ORDER BY clause, e.g. ORDER BY "a" ASC, "b" DESC.
- [SQLProvider.sqlSort()](SQLProvider/sqlSort.md): Define an SQL fragment for an individual column in an ORDER BY, e.g. "a" ASC.
- [SQLProvider.sqlLimit()](SQLProvider/sqlLimit.md): Define an SQL fragment for a LIMIT clause, e.g. LIMIT 50.
