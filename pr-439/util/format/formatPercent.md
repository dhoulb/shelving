# formatPercent()

- Kind: function
- Import: `import { formatPercent } from "shelving/util/format";`

Format a percentage (combines `getPercent()` and `formatUnit()` for convenience).
- Defaults to showing no decimal places.
- Defaults to rounding closer to zero (so that 99.99% is shown as 99%).
- Javascript's built-in percent formatting works on the `0` zero to `1` range. This uses `getPercent()` which works on `0` to `100` for convenience.

## Signatures

```ts
formatPercent(numerator: number, denumerator?: number, options?: PercentFormatOptions): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `numerator` | `number` | Number representing the amount of progress (e.g. `50`). |
| `denumerator` | `number` | The number representing the whole amount (defaults to 100). Optional. |
| `options` | `PercentFormatOptions` | Formatting options passed through to `Intl.NumberFormat`. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Locale-formatted percentage string. |
