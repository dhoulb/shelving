# DebugDBProvider

- Kind: class
- Import: `import { DebugDBProvider } from "shelving/db";`
- Extends: `ThroughDBProvider<I, T>`

Database provider that logs every operation it performs to the console for debugging.

- Wraps a `source` provider and writes `console.debug` lines (with ANSI direction markers) before and after each call, and `console.error` on failure.
- Drop it into a provider chain while developing to trace database reads and writes; it changes no data.

## Signatures

```ts
new DebugDBProvider<I, T>()
```

## Returns

| Type | Description |
| --- | --- |
| `DebugDBProvider<I, T>` |  |

## Examples

```ts
const provider = new DebugDBProvider(new MemoryDBProvider());
 await provider.getItem(users, 123); // Logs the call and its result.
```
