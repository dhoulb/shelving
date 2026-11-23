# isNumber()

- Kind: function
- Import: `import { isNumber } from "shelving/util/number";`

Is a value a finite number (optionally within a specified min/max range)?

## Signatures

```ts
isNumber(value: unknown, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY): value is number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |
| `min` | `unknown` | Minimum allowed value, inclusive (defaults to `-Infinity`). Defaults to `Number.NEGATIVE_INFINITY`. |
| `max` | `unknown` | Maximum allowed value, inclusive (defaults to `+Infinity`). Defaults to `Number.POSITIVE_INFINITY`. |

## Returns

| Type | Description |
| --- | --- |
| `value is number` | `true` if `value` is a finite number within range, otherwise `false`. |
