# DBProvider.getQuerySequence()

- Kind: method
- Member of: `DBProvider`

Subscribe to live changes for the result of a query.

## Signatures

```ts
getQuerySequence(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): ItemsSequence<II, TT>
```
