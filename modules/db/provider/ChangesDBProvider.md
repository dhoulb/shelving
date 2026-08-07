# ChangesDBProvider

A wrapping provider that records every write. `ChangesDBProvider` extends `ThroughDBProvider` and accumulates a `.changes` log of each set, update, and delete that passes through it — useful for audit trails, change feeds, and assertions in tests.

## Usage

```ts
import { ChangesDBProvider, MemoryDBProvider } from "shelving/db";

const db = new ChangesDBProvider(new MemoryDBProvider());

await db.setItem(POSTS, "abc", { title: "Hi", body: "", published: true });

console.log(db.changes);
// [{ action: "set", collection: POSTS, id: "abc", data: { … } }]
```

Every change is an explicit per-item write: `DBChange` carries the `Collection` object, the `id` of the item written, and the `data` or `updates` that were applied. Query writes are inherited two-step from `ThroughDBProvider` — resolved to their matching items, then written per item — so they arrive in the log as the individual item writes they resolved to, never as an unresolved query.

The log can be replayed onto another provider with `ChangesDBProvider.replay()` — useful for audit replay or syncing a secondary store:

```ts
const mirror = new MemoryDBProvider();
await db.replay(mirror); // Re-issues every logged write, in order.
```
