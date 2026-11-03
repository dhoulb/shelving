# MemoryTable.updateItem()

- Kind: method
- Member of: `MemoryTable`

Apply partial updates to an existing item by its id.
- Does nothing if no item exists with that id.

## Signatures

```ts
updateItem(id: I, updates: Updates<Item<I, T>>): void
```
