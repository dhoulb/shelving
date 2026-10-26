# getColor()

- Kind: function
- Import: `import { getColor } from "shelving/util/color";`

Convert an unknown value to a `Color` instance, or return `undefined` if conversion fails.

## Signatures

```ts
getColor(value: unknown): Color | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to convert. |

## Returns

| Type | Description |
| --- | --- |
| `Color \| undefined` | The converted `Color`, or `undefined` if `value` cannot be converted. |
