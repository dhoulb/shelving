# DBProvider.setQuery()

- Kind: method
- Member of: `DBProvider`

Set (overwrite) the data for every item matching a query.
- Two-step by default: resolves the query to its matching items with `getQuery()`, then sets each one concurrently with `setItem()`. Engine providers override this with a native query write where one exists (e.g. SQL `UPDATE … WHERE`).
- Not guaranteed atomic: the resolve and the writes are separate steps, so wrap the call in `transact()` when atomicity matters.

## Signatures

```ts
setQuery(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>, data: TT): Promise<void>
```
