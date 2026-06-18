# DebugDBProvider

A wrapping provider that logs every database operation to the console with ANSI formatting. `DebugDBProvider` extends [`ThroughDBProvider`](/db/ThroughDBProvider) and is a development aid — drop it into a chain to see each read and write as it happens.

## Usage

```ts
import { DebugDBProvider, MemoryDBProvider } from "shelving/db";

const provider = new DebugDBProvider(new MemoryDBProvider());

await provider.addItem(POSTS, { title: "Hello", body: "…", published: false });
// Console shows the addItem operation and its result.
```
