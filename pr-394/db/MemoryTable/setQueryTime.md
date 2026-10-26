# MemoryTable.setQueryTime()

- Kind: method
- Member of: `MemoryTable`

Mark a query as loaded, i.e. the items in this table are the complete answer to the query.
- Set the items first (e.g. with `setItems()`), then mark the query.
- Resolves `next` when the query was not marked before, so live query sequences see the change.

## Signatures

```ts
setQueryTime(query?: Query<Item<I, T>>, time: number = Date.now()): void
```
