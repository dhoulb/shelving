# MemoryTable.getQueryTime()

- Kind: method
- Member of: `MemoryTable`

Get the time a query was last marked as loaded in this table, or `undefined` if it never was.
- Use it to tell a query with no items (a time and no items) from a query that has not loaded yet (no time).
- Queries match by `getQueryKey()`, so key order does not matter, but `{ a: 1 }` does not cover `{ a: 1, b: 2 }`.

## Signatures

```ts
getQueryTime(query?: Query<Item<I, T>>): number | undefined
```
