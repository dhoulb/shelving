# MemoryTable.invalidateItem()

- Kind: method
- Member of: `MemoryTable`

Invalidate an item, so the table no longer knows anything about it.
- Removes the item and its time (see `getItemTime()`), so the item counts as not loaded, not as missing.
- Use it when the item may be out of date, but you do not know it was deleted, e.g. a fresh query result no longer contains it. Stores that read the item go back to loading, so the app loads it again.
- Only resolves `next` when the table had the item or a time for it.

## Signatures

```ts
invalidateItem(id: I): void
```
