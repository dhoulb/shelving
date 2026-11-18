# isColor()

- Kind: function
- Import: `import { isColor } from "shelving/util/color";`

Is an unknown value a `Color` instance?

## Signatures

```ts
isColor(value: unknown): value is Color
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is Color` | `true` if `value` is a `Color`, narrowing its type. |
