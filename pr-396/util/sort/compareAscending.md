# compareAscending()

- Kind: function
- Import: `import { compareAscending } from "shelving/util/sort";`

Compare two unknown values in ascending order.
- Allows values of different types to be ranked for sorting.

1. Numbers and dates (ascending order: -Infinity, negative, zero, positive, Infinity, NaN)
2. Strings (locale-aware order)
3. `true`
4. `false`
5. `null`
6. Unsorted values (objects that can't be converted to number or string, symbols, NaN, etc)
7. `undefined`

## Signatures

```ts
compareAscending(left: unknown, right: unknown): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The first value to rank. |
| `right` | `unknown` | The second value to rank. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number below zero if `left` is higher, number above zero if `right` is higher, or `0` if they're equally sorted. |
