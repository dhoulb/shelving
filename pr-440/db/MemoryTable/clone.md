# MemoryTable.clone()

- Kind: method
- Member of: `MemoryTable`

Clone this table into a new plain `MemoryTable` containing the same items.

- Shallow: a new map sharing the same (immutable) item instances, so cloning is cheap.
- The clone is always a plain `MemoryTable`, even when called on a subclass — writes to the clone have no side effects (e.g. `StorageTable` persistence).

## Signatures

```ts
clone(): MemoryTable<I, T>
```
