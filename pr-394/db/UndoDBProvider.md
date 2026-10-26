# UndoDBProvider

- Kind: class
- Import: `import { UndoDBProvider } from "shelving/db";`
- Extends: `RecordingDBProvider<I, T>`

Database provider that records every operation and can undo its own writes.

- Extends `RecordingDBProvider`, additionally reading each item before the first write that touches it — so the log always contains every touched item's original state.
- Call `undo()` to restore the wrapped provider to the state the log first observed, e.g. rolling back optimistic local updates after a failed server call.
- The extra read is skipped when the log already establishes the item's state (an earlier read observed it, or an earlier add created it) — over a local `MemoryDBProvider` the reads are effectively free anyway.

A recording provider whose writes can be undone. `UndoDBProvider` extends `RecordingDBProvider` and reads each item before the first write that touches it, so the `operations` log always contains every touched item's original state — which `UndoDBProvider.undo()` restores by applying the log's earliest observations in reverse.

## Usage — optimistic updates

Apply changes to a local copy immediately so the UI updates instantly, push to the server, and roll back if the push fails:

```ts
import { UndoDBProvider } from "shelving/db";

const local = new UndoDBProvider(memory);
await runServiceLogic(local); // Applies locally right away.
try {
  await api.push(local.writes); // Send the writes to the server.
} catch {
  await local.undo(); // Server failed — restore the local copy.
}
```

Things to know:

- The extra read happens only for the first write that touches each item — skipped when the log already establishes the item's state (an earlier read observed it, a query returned it, or an earlier add created it). Over a local `MemoryDBProvider` the reads are effectively free anyway.
- `UndoDBProvider.undo()` restores touched items unconditionally, so concurrent writes made to those items since the recording are overwritten.
- `UndoDBProvider.undo()` writes directly to `source` without recording, so the log still describes the original operations afterwards.


## Signatures

```ts
new UndoDBProvider<I, T>()
```

## Returns

| Type | Description |
| --- | --- |
| `UndoDBProvider<I, T>` |  |

## Examples

```ts
const local = new UndoDBProvider(memory);
 await runServiceLogic(local); // Applies locally right away.
 try {
 	await api.push(local.writes); // Send the writes to the server.
 } catch {
 	await local.undo(); // Server failed — restore the local copy.
 }
```

## Methods

- [UndoDBProvider.undo()](UndoDBProvider/undo.md): Restore the wrapped provider to the state the log first observed, undoing this provider's writes.
