# mapSequence()

- Kind: function
- Import: `import { mapSequence } from "shelving/util/transform";`

Lazily transform items in an async sequence as they are yielded.
- The transform may be synchronous or return a promise; awaited values are yielded in order.

## Signatures

```ts
mapSequence(sequence: AsyncIterable<I>, transform: (input: I, ...args: A) => O | PromiseLike<O>, ...args: A): AsyncIterable<O>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `sequence` | `AsyncIterable<I>` | The source async iterable of items. |
| `transform` | `(input: I, ...args: A) => O \| PromiseLike<O>` | Function applied to each item to produce the output item (may be async). |
| `args` | `A` | Additional arguments passed through to `transform` on every call. |

## Returns

| Type | Description |
| --- | --- |
| `AsyncIterable<O>` | An async iterable yielding each transformed item. |
