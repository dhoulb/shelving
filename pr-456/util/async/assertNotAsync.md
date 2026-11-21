# assertNotAsync()

- Kind: function
- Import: `import { assertNotAsync } from "shelving/util/async";`

Assert an unknown value is synchronous (i.e. does not have a `.then()` method).

## Signatures

```ts
assertNotAsync(value: PromiseLike<T> | T): asserts value is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PromiseLike<T> \| T` | The value to assert. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is T` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is a `PromiseLike`. |

## Examples

```ts
assertNotAsync(123); // passes
```
