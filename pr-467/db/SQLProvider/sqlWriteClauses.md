# SQLProvider.sqlWriteClauses()

- Kind: method
- Member of: `SQLProvider`

Define an SQL fragment for the clauses that select the rows an `UPDATE` or `DELETE` writes to.
- `UPDATE` and `DELETE` do not accept `ORDER BY` or `LIMIT` in most databases (Postgres never, SQLite only with a compile option).
- A query with no `$limit` writes to every matching row, so this ignores `$order` and returns only the `WHERE` clause.
- A query with a `$limit` selects the ids of the matching rows in a subquery, e.g. ` WHERE "id" IN (SELECT "id" FROM "users" WHERE ... ORDER BY ... LIMIT 5)`.

## Signatures

```ts
sqlWriteClauses(collection: Collection<string, Identifier, Data>, query: Query<Item>): SQLFragment
```
