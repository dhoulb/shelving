# throwAsync()

- Kind: function
- Import: `import { throwAsync } from "shelving/util/async";`

Throw the value if it's an async (promised) value.

## Signatures

```ts
throwAsync(value: PromiseLike<T> | T): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PromiseLike<T> \| T` | The value to unwrap. |

## Returns

| Type | Description |
| --- | --- |
| `T` | Synchronous (not promised) value. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | Promise if value is an asynchronous (promised) value. |
