# getRange()

- Kind: function
- Import: `import { getRange } from "shelving/util/iterate";`

Yield a range of numbers from `start` to `end`
- Yields in descending order if `end` is lower than `start`
- Both `start` and `end` are inclusive.

## Signatures

```ts
getRange(start: number, end: number): Iterable<number>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `start` | `number` | The first number to yield. |
| `end` | `number` | The last number to yield (inclusive). |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<number>` | An iterable yielding the numbers between `start` and `end`. |
