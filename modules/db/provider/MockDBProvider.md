# MockDBProvider

A test provider that records every call. `MockDBProvider` extends [`MemoryDBProvider`](/db/MemoryDBProvider) — so it behaves like a real in-memory database — and additionally captures every operation in a `.calls` array so tests can assert exactly what happened.

## Usage

```ts
import { MockDBProvider } from "shelving/db";

const mock = new MockDBProvider();
await mock.addItem(POSTS, { title: "Hello", body: "", published: false });

console.log(mock.calls[0]);
// { type: "addItem", collection: "posts", data: { … }, result: <id> }
```

## See also

- [`MemoryDBProvider`](/db/MemoryDBProvider) — the in-memory base.
- [`ChangesDBProvider`](/db/ChangesDBProvider) — records writes only, as a change log.
- [db/provider](/db/provider) — overview of the provider hierarchy.
