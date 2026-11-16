# MemoryTable.deleteItem()

- Kind: method
- Member of: `MemoryTable`

Delete an item by its id.
- Sets the item's time (see `getItemTime()`), even when the item does not exist, so the table knows the item is missing.
- Only resolves `next` when an item was actually removed, or the item had no time.

## Signatures

```ts
deleteItem(id: I): void
```
