# MemoryTable.getQuerySequence()

- Kind: method
- Member of: `MemoryTable`

Subscribe to the live result of a query.
- Emits the current query result immediately, even if empty.
- Wakes on every table change, but only yields when the computed query result changed, or the query was first marked as loaded (see `getQueryTime()`).

## Signatures

```ts
getQuerySequence(query?: Query<Item<I, T>>): AsyncIterable<Items<I, T>>
```
