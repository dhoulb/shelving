# DBProvider.requireFirst()

- Kind: method
- Member of: `DBProvider`

Get the first item matching a query, or throw if there are none.

## Signatures

```ts
requireFirst(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<Item<II, TT>>
```
