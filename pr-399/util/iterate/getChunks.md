# getChunks()

- Kind: function
- Import: `import { getChunks } from "shelving/util/iterate";`

Yield chunks of a given size.
- The final chunk may contain fewer than `size` items.

## Signatures

```ts
getChunks(items: Iterable<T>, size: number): Iterable<readonly T[]>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<T>` | The iterable to split into chunks. |
| `size` | `number` | The maximum number of items per chunk. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<readonly T[]>` | An iterable yielding arrays of up to `size` items. |
