# ValidationDBProvider

- Kind: class
- Import: `import { ValidationDBProvider } from "shelving/db";`
- Extends: `ThroughDBProvider<I, T>`

Database provider that validates data flowing to and from an asynchronous source provider.

- Wraps a `source` provider (which may have any type, because validation guarantees the type) and runs every value through the relevant `Collection` schema before writing and after reading.
- Written data is validated against the collection's data schema; read data is validated against the item schema, so trusted, correctly-typed values reach the rest of the app.
- Updates are validated with `Collection.updates`, and every query with `Collection.query`, so an unknown key or a bad value never reaches the source.
- Validation failures here are program-state errors, so they throw a typed `ValueError` rather than a raw validation `string`.
- Applies inside `transact()` too — the transaction provider the callback receives validates its reads and writes the same way.

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


## Signatures

```ts
new ValidationDBProvider<I, T>()
```

## Returns

| Type | Description |
| --- | --- |
| `ValidationDBProvider<I, T>` |  |
