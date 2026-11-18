# MemoryTable.setItemSequence()

- Kind: method
- Member of: `MemoryTable`

Mirror an async sequence of item values into this table, passing each value through.
- Sets the item when a value arrives, or deletes it when the value is `undefined`.

## Signatures

```ts
setItemSequence(id: I, sequence: AsyncIterable<OptionalItem<I, T>>): AsyncIterable<OptionalItem<I, T>>
```
