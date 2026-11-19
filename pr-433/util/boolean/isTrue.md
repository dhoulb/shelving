# isTrue()

- Kind: function
- Import: `import { isTrue } from "shelving/util/boolean";`

Is an unknown value exactly `true`?

## Signatures

```ts
isTrue(value: unknown): value is true
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is true` | `true` if `value` is the literal `true`, narrowing its type. |
