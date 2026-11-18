# isFunction()

- Kind: function
- Import: `import { isFunction } from "shelving/util/function";`

Is a value a function?

## Signatures

```ts
isFunction(value: unknown): value is AnyFunction
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is AnyFunction` | `true` if `value` is a function, narrowing its type to `AnyFunction`. |
