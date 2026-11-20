# roundNumber()

- Kind: function
- Import: `import { roundNumber } from "shelving/util/number";`

Round a number to a specified set of decimal places.
- Better than `Math.round()` because it allows a `precision` argument.
- Better than `num.toFixed()` because it trims excess `0` zeroes.

## Signatures

```ts
roundNumber(num: number, precision = 0): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `num` | `number` | The number to round. |
| `precision` | `unknown` | Maximum number of digits shown after the decimal point (defaults to 10). Defaults to `0`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | The number rounded to the specified precision. |
