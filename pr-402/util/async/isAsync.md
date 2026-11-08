# isAsync()

- Kind: function
- Import: `import { isAsync } from "shelving/util/async";`

Is a value an asynchronous value implementing a `then()` function.

## Signatures

```ts
isAsync(value: PromiseLike<T> | T): value is PromiseLike<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PromiseLike<T> \| T` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is PromiseLike<T>` | `true` if `value` is a `PromiseLike`, narrowing its type. |
