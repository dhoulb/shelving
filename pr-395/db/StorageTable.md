# StorageTable

- Kind: class
- Import: `import { StorageTable } from "shelving/db";`
- Extends: `MemoryTable<I, T>`

`MemoryTable` that persists its items to a `Storage` instance — self-contained, so it can also be used independently of `StorageDBProvider`.

- Hydrates itself from storage on construction, then persists each write *before* applying it to memory, so a failed write (e.g. `QuotaExceededError` when the origin's quota is full) throws and leaves memory and storage consistent.
- Items are stored as JSON under keys formatted as `{prefix}{collection}:{id}`, so values must be JSON-serializable. The id in the key is authoritative — an `id` stored inside the JSON is overridden.
- Listens for `storage` events, so changes made in other tabs/windows update memory and notify realtime sequences. Dispose the table (or its provider) to remove the listener.

## Signatures

```ts
new StorageTable<I, T>(collection: Collection<string, I, T>, storage: Storage, prefix = "shelving:")
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `collection` | `Collection<string, I, T>` |  |
| `storage` | `Storage` |  |
| `prefix` | `unknown` | Defaults to `"shelving:"`. |

## Returns

| Type | Description |
| --- | --- |
| `StorageTable<I, T>` |  |
