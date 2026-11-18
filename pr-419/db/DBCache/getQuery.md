# DBCache.getQuery()

- Kind: method
- Member of: `DBCache`

Get (or create) a `QueryStore` for a collection/query in one hop.

## Signatures

```ts
getQuery(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): QueryStore<II, TT>
```
