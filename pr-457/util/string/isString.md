# isString()

- Kind: function
- Import: `import { isString } from "shelving/util/string";`

Is an unknown value a string?

## Signatures

```ts
isString(value: unknown): value is string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

## Returns

| Type | Description |
| --- | --- |
| `value is string` | `true` if `value` is a `string`, otherwise `false`. |
