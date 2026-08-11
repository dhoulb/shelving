# RecordingDBProvider

A wrapping provider that records every operation. `RecordingDBProvider` extends `ThroughDBProvider` and accumulates an `operations` log of every read and write that passes through it — useful for audit trails, change feeds, optimistic updates, and assertions in tests.

## Usage

```ts
import { RecordingDBProvider, MemoryDBProvider } from "shelving/db";

const db = new RecordingDBProvider(new MemoryDBProvider());

await db.getItem(POSTS, "abc");
await db.setItem(POSTS, "abc", { title: "Hi", body: "", published: true });

console.log(db.operations);
// [{ action: "get", collection: POSTS, id: "abc", data: undefined },
//  { action: "set", collection: POSTS, id: "abc", data: { … } }]
```

Every operation is an explicit per-item `DBOperation` carrying the `Collection` object, the `id`, and the `data` or `updates` involved. Reads record what they observed — `getItem()` logs a `"get"` with the item (or `undefined` for confirmed absence), and `getQuery()` logs a `"get"` per item it returned. Query writes are inherited two-step from `ThroughDBProvider`, so they arrive in the log as their resolve reads plus the individual item writes. Realtime sequences are not recorded. Filter the log with the `RecordingDBProvider.writes` and `RecordingDBProvider.reads` getters.

## Replaying

`replayOperations()` re-issues a list of operations onto a provider in order, and three methods delegate to it:

- `RecordingDBProvider.replayWrites()` — writes only. The right call for **authoritative** targets that hold their own truth (re-applying a log to a real database, audit replay, syncing a second source of truth): updates compose onto current state as deltas, and observed reads are never allowed to overwrite newer data.
- `RecordingDBProvider.replay()` — everything, in order. The right call for **mirrors**: reads apply what they observed (setting the item, or deleting it when the read confirmed absence), refreshing stale copies and giving update deltas their correct base.
- `RecordingDBProvider.replayReads()` — reads only, e.g. warming a cache from a recorded session.

`MemoryDBProvider.transact()` is built on this: it records the callback's operations against a snapshot clone, then commits with `RecordingDBProvider.replayWrites()`.

## Undo

`UndoDBProvider` extends this provider to read each item before the first write that touches it, so the log always contains every touched item's original state — which `UndoDBProvider.undo()` restores, enabling optimistic local updates that roll back when a server call fails.
