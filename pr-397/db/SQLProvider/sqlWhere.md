# SQLProvider.sqlWhere()

- Kind: method
- Member of: `SQLProvider`

Define an SQL fragment for a `WHERE` clause, e.g. ` WHERE x = 1 AND y <= 100`.

- Returns an empty fragment when the query has no filters.

## Signatures

```ts
sqlWhere(query: Query<Item>): void
```
