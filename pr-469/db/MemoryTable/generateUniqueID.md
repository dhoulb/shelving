# MemoryTable.generateUniqueID()

- Kind: method
- Member of: `MemoryTable`

Generate a unique id for a new item in this table.
- Uses a random string for `StringSchema` ids, otherwise a random number, regenerating until it doesn't collide.

## Signatures

```ts
generateUniqueID(): I
```
