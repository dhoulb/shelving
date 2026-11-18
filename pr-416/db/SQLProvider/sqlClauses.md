# SQLProvider.sqlClauses()

- Kind: method
- Member of: `SQLProvider`

Define an SQL fragment for the `WHERE`, `ORDER BY` and `LIMIT` clauses of a query, e.g. ` WHERE x = 1 ORDER BY "name" LIMIT 0, 50`.

## Signatures

```ts
sqlClauses(query: Query<Item>): void
```
