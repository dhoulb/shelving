# isInteger()

- Kind: function
- Import: `import { isInteger } from "shelving/util/number";`

Is an unknown value an integer (optionally within specified min/max values)?

## Signatures

```ts
isInteger(value: unknown, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER): value is number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |
| `min` | `unknown` | Minimum allowed value, inclusive (defaults to `Number.MIN_SAFE_INTEGER`). Defaults to `Number.MIN_SAFE_INTEGER`. |
| `max` | `unknown` | Maximum allowed value, inclusive (defaults to `Number.MAX_SAFE_INTEGER`). Defaults to `Number.MAX_SAFE_INTEGER`. |

## Returns

| Type | Description |
| --- | --- |
| `value is number` | `true` if `value` is an integer within range, otherwise `false`. |
