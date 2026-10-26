# isObject()

- Kind: function
- Import: `import { isObject } from "shelving/util/object";`

Is an unknown value an unknown object?

## Signatures

```ts
isObject(value: unknown): value is ImmutableObject
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is ImmutableObject` | `true` if `value` is a non-null `object`, narrowing its type. |
