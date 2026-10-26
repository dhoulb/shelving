# isStringLength()

- Kind: function
- Import: `import { isStringLength } from "shelving/util/string";`

Is a value a string with a length between `min` and `max`?

## Signatures

```ts
isStringLength(value: unknown, min = 0, max = Number.POSITIVE_INFINITY): value is string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |
| `min` | `unknown` | The minimum allowed length (defaults to `0`). Defaults to `0`. |
| `max` | `unknown` | The maximum allowed length (defaults to `Infinity`). Defaults to `Number.POSITIVE_INFINITY`. |

## Returns

| Type | Description |
| --- | --- |
| `value is string` | `true` if `value` is a string within the length bounds, otherwise `false`. |
