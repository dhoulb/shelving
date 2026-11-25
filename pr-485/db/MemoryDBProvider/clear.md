# MemoryDBProvider.clear()

- Kind: method
- Member of: `MemoryDBProvider`

Forget every item and query in every table, so the provider is empty again.
- Each table forgets its items, item times and query times, so stores that read it go back to loading, not to missing.
- Open sequences stay open and get the change, like after any other write.

## Signatures

```ts
clear(): void
```
