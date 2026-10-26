# MemoryTable.getItemSequence()

- Kind: method
- Member of: `MemoryTable`

Subscribe to all changes for this item key.
- Emits the current item immediately, including `undefined` when absent.
- Wakes on every table change, but only yields when this item's value actually changed.

## Signatures

```ts
getItemSequence(id: I): AsyncIterable<OptionalItem<I, T>>
```
