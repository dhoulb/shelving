# MemoryTable.clear()

- Kind: method
- Member of: `MemoryTable`

Forget every item and query in this table, so it is empty again.
- Removes every item, item time and query time, so stores that read the table go back to loading, not to missing.
- Only resolves `next` when the table knew something.

## Signatures

```ts
clear(): void
```
