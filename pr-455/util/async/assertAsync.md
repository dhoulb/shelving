# assertAsync()

- Kind: function
- Import: `import { assertAsync } from "shelving/util/async";`

Assert an unknown value is asynchronous (i.e. has a `.then()` method).

## Signatures

```ts
assertAsync(value: PromiseLike<T> | T): asserts value is PromiseLike<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PromiseLike<T> \| T` | The value to assert. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is PromiseLike<T>` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not a `PromiseLike`. |

## Examples

```ts
assertAsync(Promise.resolve(1)); // passes
```
