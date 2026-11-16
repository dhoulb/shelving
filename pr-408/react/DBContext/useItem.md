# DBContext.useItem()

- Kind: method
- Member of: `DBContext`

Get an `ItemStore` for the specified collection item in the current `DataProvider` context and subscribe to any changes in it.

## Signatures

```ts
useItem(collection: Nullish<Collection<string, II, TT>>, id: Nullish<II>): ItemStore<II, TT> | undefined
useItem(collection: Collection<string, II, TT>, id: II): ItemStore<II, TT>
```
