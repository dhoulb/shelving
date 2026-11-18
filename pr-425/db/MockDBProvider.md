# MockDBProvider

- Kind: class
- Import: `import { MockDBProvider } from "shelving/db";`
- Extends: `MemoryDBProvider<I, T>`

In-memory database provider that records every operation to its `calls` log, for testing.

- Extends `MemoryDBProvider`, so it stores data normally, then appends a `MockDBCall` entry (including the result) for each call.
- Assert against `calls` in tests to check which operations ran and with what arguments.

## Signatures

```ts
new MockDBProvider<I, T>()
```

## Returns

| Type | Description |
| --- | --- |
| `MockDBProvider<I, T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `calls` | `MockDBCall[]` | The log of operations performed through this provider, in the order they happened. Read only. Defaults to `[]`. |

## Examples

```ts
const provider = new MockDBProvider();
 await provider.addItem(users, { name: "Dave" });
 provider.calls; // [{ type: "addItem", collection: "users", data: { name: "Dave" }, result: 123 }]
```
