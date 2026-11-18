# isInstance()

- Kind: function
- Import: `import { isInstance } from "shelving/util/class";`

Is a value an instance of a class?

## Signatures

```ts
isInstance(value: unknown, type: Class<T>): value is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |
| `type` | `Class<T>` | The class to test `value` against. |

## Returns

| Type | Description |
| --- | --- |
| `value is T` | `true` if `value` is an instance of `type`, narrowing its type. |
