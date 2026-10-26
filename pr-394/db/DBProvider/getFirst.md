# DBProvider.getFirst()

- Kind: method
- Member of: `DBProvider`

Get the first item matching a query, or `undefined` if there are none.

## Signatures

```ts
getFirst(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<OptionalItem<II, TT>>
```
