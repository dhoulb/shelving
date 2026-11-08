# isBoolean()

- Kind: function
- Import: `import { isBoolean } from "shelving/util/boolean";`

Is an unknown value a boolean?

## Signatures

```ts
isBoolean(value: unknown): value is boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is boolean` | `true` if `value` is a `boolean`, narrowing its type. |
