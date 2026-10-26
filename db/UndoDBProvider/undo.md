# UndoDBProvider.undo()

- Kind: method
- Member of: `UndoDBProvider`

Restore the wrapped provider to the state the log first observed, undoing this provider's writes.

- Applies the state-establishing operations in reverse order, so the earliest observed state of each item wins: reads restore the item that was observed (or delete it when the read confirmed it absent), and adds delete (the item did not exist before).
- Restores touched items unconditionally, so concurrent writes made to those items since the recording are overwritten.
- Writes directly to `source` without recording, so the log still describes the original operations afterwards.

## Signatures

```ts
undo(): Promise<void>
```
