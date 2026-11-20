# truncateNumber()

- Kind: function
- Import: `import { truncateNumber } from "shelving/util/number";`

Truncate a number to a specified set of decimal places.
- Better than `Math.trunc()` because it allows a `precision` argument.

## Signatures

```ts
truncateNumber(num: number, precision = 0): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `num` | `number` | The number to truncate. |
| `precision` | `unknown` | Maximum number of digits shown after the decimal point (defaults to 0). Defaults to `0`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | The number truncated to the specified precision. |
