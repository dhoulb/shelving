# isStringBetween()

- Kind: function
- Import: `import { isStringBetween } from "shelving/util/string";`

Does a string have a length between `min` and `max`?

## Signatures

```ts
isStringBetween(str: string, min = 0, max = Number.POSITIVE_INFINITY): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to measure. |
| `min` | `unknown` | The minimum allowed length (defaults to `0`). Defaults to `0`. |
| `max` | `unknown` | The maximum allowed length (defaults to `Infinity`). Defaults to `Number.POSITIVE_INFINITY`. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if `str` is within the length bounds, otherwise `false`. |
