# CacheDBProvider

A wrapping provider that keeps an in-memory mirror in sync with a remote source. `CacheDBProvider` holds a `MemoryDBProvider` and populates it as data is read, so subsequent reads are synchronous — the basis of synchronous first renders in the React integration.

The constructor takes the `source` provider and an optional `MemoryDBProvider` to use as the mirror (one is created by default).

## Usage

```ts
import { CacheDBProvider, ValidationDBProvider, MemoryDBProvider } from "shelving/db";

const provider = new CacheDBProvider(
  new ValidationDBProvider(new MemoryDBProvider())
);

await provider.getItem(POSTS, "abc"); // fetches from source, populates the mirror
await provider.getItem(POSTS, "abc"); // served synchronously from the mirror
```

`DBCache` finds the `CacheDBProvider` in a chain automatically and reuses its mirror to seed reactive stores.

`DBProvider.transact()` is not supported and throws `UnsupportedError`. A correct implementation would need to capture the changes written during the transaction and play them back into the mirror only once the transaction commits (abandoning them on a throw) — mirroring writes as they happen would populate the cache with uncommitted data.
