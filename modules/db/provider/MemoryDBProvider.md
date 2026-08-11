# MemoryDBProvider

A fully in-memory `DBProvider`. `MemoryDBProvider` stores every collection in plain memory — fast, with no persistence. It is ideal for tests and prototypes, and it is also the mirror layer that `CacheDBProvider` keeps in sync.

Unlike the SQL providers, `MemoryDBProvider` supports realtime sequences (`getItemSequence`, `getQuerySequence`).

## Usage

```ts
import { MemoryDBProvider } from "shelving/db";

const provider = new MemoryDBProvider();

const id = await provider.addItem(POSTS, { title: "Hello", body: "First post.", published: false });
const post = await provider.getItem(POSTS, id);

// Realtime — emits whenever the item changes.
for await (const next of provider.getItemSequence(POSTS, id)) {
  console.log(next);
}
```

## Transactions

`MemoryDBProvider.transact()` hands the callback a shallow snapshot clone of the provider (see `MemoryDBProvider.clone()`) wrapped in a `RecordingDBProvider` to record its operations, then replays the recorded writes onto the real provider with `RecordingDBProvider.replayWrites()` when the callback resolves — so live subscriptions fire naturally on commit, and a thrown callback commits nothing:

```ts
await provider.transact(async db => {
  const post = await db.requireItem(POSTS, id);
  await db.updateItem(POSTS, id, { title: `${post.title}!` });
});
```

Things to know:

- The clone is a full provider, so everything works inside the callback: reads see a snapshot from when the transaction began plus the transaction's own writes, realtime sequences observe the transaction's state, and nested `transact()` commits into the outer transaction. Portable code must not rely on any of this — see `DBProvider.transact()` for the weakest shared contract.
- The clone is disposed when the transaction completes or fails, ending any sequences opened inside the callback.
- Writes made to the provider while the callback is running are kept — the recorded writes replay on top in order (updates apply as deltas, sets and deletes overwrite), with no conflict detection. Overlapping transactions replay in completion order, last write wins per item.
- Query writes (`setQuery`, `updateQuery`, `deleteQuery`) resolve two-step against the clone, so they commit to exactly the items they matched inside the transaction, even if concurrent writes changed which items match.
