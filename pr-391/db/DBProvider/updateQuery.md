# DBProvider.updateQuery()

- Kind: method
- Member of: `DBProvider`

Apply partial updates to every item matching a query.
- Two-step by default: resolves the query to its matching items with `getQuery()`, then updates each one concurrently with `updateItem()`. Engine providers override this with a native query write where one exists (e.g. SQL `UPDATE … WHERE`).
- Not guaranteed atomic: the resolve and the writes are separate steps, so wrap the call in `transact()` when atomicity matters.

## Signatures

```ts
updateQuery(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>, updates: Updates<TT>): Promise<void>
```
