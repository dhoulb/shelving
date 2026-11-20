# SQLProvider.sqlLimit()

- Kind: method
- Member of: `SQLProvider`

Define an SQL fragment for a `LIMIT` clause, e.g. ` LIMIT 50`.
- Returns an empty fragment when the query has no limit.

## Signatures

```ts
sqlLimit(query: Query<Item>): void
```
