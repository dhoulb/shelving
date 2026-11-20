# DBProvider.getItem()

- Kind: method
- Member of: `DBProvider`

Get an item from a collection by its id, or `undefined` if it doesn't exist.

## Signatures

```ts
getItem(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>>
```
