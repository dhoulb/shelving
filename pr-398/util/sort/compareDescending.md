# compareDescending()

- Kind: function
- Import: `import { compareDescending } from "shelving/util/sort";`

Compare two unknown values in descending order.
- The exact inverse of `compareAscending()`.

## Signatures

```ts
compareDescending(left: unknown, right: unknown): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The first value to rank. |
| `right` | `unknown` | The second value to rank. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number below zero if `right` is higher, number above zero if `left` is higher, or `0` if they're equally sorted. |
