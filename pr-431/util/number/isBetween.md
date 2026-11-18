# isBetween()

- Kind: function
- Import: `import { isBetween } from "shelving/util/number";`

Is a number within a specified range?

## Signatures

```ts
isBetween(num: number, min: number, max: number): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `num` | `number` | The number to test, e.g. `17` |
| `min` | `number` | The start of the range, e.g. `10` |
| `max` | `number` | The end of the range, e.g. `20` |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if `num` is between `min` and `max` (inclusive), otherwise `false`. |
