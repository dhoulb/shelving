# MemoryTable.setItem()

- Kind: method
- Member of: `MemoryTable`

Set (insert or overwrite) an item by its id.
- Sets the item's time (see `getItemTime()`).
- Only resolves `next` when the stored instance actually changes, or the item had no time.

## Signatures

```ts
setItem(id: I, data: Item<I, T> | T): void
```
