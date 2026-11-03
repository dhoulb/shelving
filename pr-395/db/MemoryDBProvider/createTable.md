# MemoryDBProvider.createTable()

- Kind: method
- Member of: `MemoryDBProvider`

Create a new `MemoryTable` for a collection (without registering it — use `getTable()` for that).
- Override point for subclasses that back collections with a specialised table, e.g. `StorageDBProvider`.

## Signatures

```ts
createTable(collection: Collection<string, II, TT>): MemoryTable<II, TT>
```
