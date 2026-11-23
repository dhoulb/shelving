# DBContext.useQuery()

- Kind: method
- Member of: `DBContext`

Get an `QueryStore` for the specified collection query in the current `DataProvider` context and subscribe to any changes in it.

## Signatures

```ts
useQuery(collection: Nullish<Collection<string, II, TT>>, query: Nullish<Query<Item<II, TT>>>): QueryStore<II, TT> | undefined
useQuery(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): QueryStore<II, TT>
```
