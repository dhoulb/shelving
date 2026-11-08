# isFalse()

- Kind: function
- Import: `import { isFalse } from "shelving/util/boolean";`

Is an unknown value exactly `false`?

## Signatures

```ts
isFalse(value: unknown): value is false
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is false` | `true` if `value` is the literal `false`, narrowing its type. |
