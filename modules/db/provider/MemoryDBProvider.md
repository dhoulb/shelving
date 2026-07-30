# MemoryDBProvider

A fully in-memory `DBProvider`. `MemoryDBProvider` stores every collection in plain memory — fast, with no persistence. It is ideal for tests and prototypes, and it is also the mirror layer that `CacheDBProvider` keeps in sync.

Unlike the SQL providers, `MemoryDBProvider` supports realtime sequences (`getItemSequence`, `getQuerySequence`).

It also supports `DBProvider.transact()`: writes made in the callback are buffered, then applied synchronously when the callback resolves, so the commit is atomic and a thrown callback changes nothing. There is no conflict detection — commits from overlapping transactions apply in completion order.

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
