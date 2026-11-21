# notAsync()

- Kind: function
- Import: `import { notAsync } from "shelving/util/async";`

Is a value a synchronous value.

## Signatures

```ts
notAsync(value: PromiseLike<T> | T): value is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PromiseLike<T> \| T` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is T` | `true` if `value` is not a `PromiseLike`, narrowing its type. |
