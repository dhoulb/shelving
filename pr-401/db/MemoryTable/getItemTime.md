# MemoryTable.getItemTime()

- Kind: method
- Member of: `MemoryTable`

Get the time an item was last set or deleted in this table, or `undefined` if it never was.
- Use it to tell an item that does not exist (a time and no item) from an item that has not loaded yet (no time).

## Signatures

```ts
getItemTime(id: I): number | undefined
```
