# SQLProvider.sqlOrder()

- Kind: method
- Member of: `SQLProvider`

Define an SQL fragment for an `ORDER BY` clause, e.g. ` ORDER BY "a" ASC, "b" DESC`.
- Returns an empty fragment when the query has no orders.
- Nested keys (multi-segment) throw `UnsupportedError`.

## Signatures

```ts
sqlOrder(query: Query<Item>): void
```
