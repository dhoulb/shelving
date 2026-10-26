# filterSequence()

- Kind: function
- Import: `import { filterSequence } from "shelving/util/filter";`

Filter a sequence of values using a matcher.

## Signatures

```ts
filterSequence(sequence: AsyncIterable<T>, match: Match, ...args: A): AsyncIterable<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `sequence` | `AsyncIterable<T>` | Async iterable of items to filter. |
| `match` | `Match` | Matcher called with each item (plus any extra `args`); items it returns `true` for are kept. |
| `args` | `A` | Extra arguments passed to `match` after each item. |

## Returns

| Type | Description |
| --- | --- |
| `AsyncIterable<T>` | Async iterable yielding only the items the matcher returned `true` for. |
