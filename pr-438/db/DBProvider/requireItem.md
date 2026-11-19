# DBProvider.requireItem()

- Kind: method
- Member of: `DBProvider`

Get an item from a collection by its id, or throw if it doesn't exist.

## Signatures

```ts
requireItem(collection: Collection<string, II, TT>, id: II): Promise<Item<II, TT>>
```
