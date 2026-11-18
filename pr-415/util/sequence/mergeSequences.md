# mergeSequences()

- Kind: function
- Import: `import { mergeSequences } from "shelving/util/sequence";`

Merge several sequences (calls the sequences in series).
- Yields all items from the first sequence, then all items from the second, and so on.

## Signatures

```ts
mergeSequences(...sequences: AsyncIterable<T>[]): AsyncIterable<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `sequences` | `AsyncIterable<T>[]` | The sequences to merge, drained one after another in order. |

## Returns

| Type | Description |
| --- | --- |
| `AsyncIterable<T>` | An async iterable that yields every item from each sequence in turn. |
