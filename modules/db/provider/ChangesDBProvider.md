# ChangesDBProvider

A wrapping provider that records every write. `ChangesDBProvider` extends [`ThroughDBProvider`](/db/provider/ThroughDBProvider) and accumulates a `.changes` log of each set, update, and delete that passes through it — useful for audit trails, change feeds, and assertions in tests.

## Usage

```ts
import { ChangesDBProvider, MemoryDBProvider } from "shelving/db";

const db = new ChangesDBProvider(new MemoryDBProvider());

await db.setItem(POSTS, "abc", { title: "Hi", body: "", published: true });

console.log(db.changes);
// [{ action: "set", collection: "posts", id: "abc", data: { … } }]
```

## See also

- [ThroughDBProvider](/db/provider/ThroughDBProvider) — the pass-through base.
- [MockDBProvider](/db/provider/MockDBProvider) — records all calls, not just writes.
- [db/provider](/db/provider) — overview of the provider hierarchy.
