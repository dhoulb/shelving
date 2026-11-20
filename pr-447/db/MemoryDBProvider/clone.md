# MemoryDBProvider.clone()

- Kind: method
- Member of: `MemoryDBProvider`

Clone this provider into a new plain `MemoryDBProvider` containing the same items.

- Shallow: new tables and maps sharing the same (immutable) item instances, so cloning is cheap and unchanged items keep their identity.
- The clone is always a plain `MemoryDBProvider` with plain `MemoryTable`s, even when called on a subclass — writes to the clone only touch its own memory, never a subclass's backing store (e.g. `StorageDBProvider` persistence).

## Signatures

```ts
clone(): MemoryDBProvider<I, T>
```
