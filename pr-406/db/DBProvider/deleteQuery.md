# DBProvider.deleteQuery()

- Kind: method
- Member of: `DBProvider`

Delete every item matching a query.
- Two-step by default: resolves the query to its matching items with `getQuery()`, then deletes each one concurrently with `deleteItem()`. Engine providers override this with a native query write where one exists (e.g. SQL `DELETE … WHERE`).
- Not guaranteed atomic: the resolve and the writes are separate steps, so wrap the call in `transact()` when atomicity matters.

## Signatures

```ts
deleteQuery(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<void>
```
