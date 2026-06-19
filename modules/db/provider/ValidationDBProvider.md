# ValidationDBProvider

A wrapping provider that validates data against the collection schema. `ValidationDBProvider` validates data on the way **in** (writes) and on the way **out** (reads) — so bad data never reaches the backend, and corrupt data from the backend surfaces as a `ValueError` rather than propagating silently.

Place it between the cache and the backend so cached data is always known-good.

## Usage

```ts
import { ValidationDBProvider, MemoryDBProvider } from "shelving/db";

const provider = new ValidationDBProvider(new MemoryDBProvider());

// Validated against the POSTS schema before writing.
await provider.addItem(POSTS, { title: "Hello", body: "…", published: false });

// If the backend ever returns data that fails the schema, this throws ValueError.
const post = await provider.getItem(POSTS, "abc");
```
