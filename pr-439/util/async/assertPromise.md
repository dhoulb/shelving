# assertPromise()

- Kind: function
- Import: `import { assertPromise } from "shelving/util/async";`

Assert that an unknown value is a `Promise`.

## Signatures

```ts
assertPromise(value: Promise<T> | T): asserts value is Promise<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `Promise<T> \| T` | The value to assert. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is Promise<T>` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not a `Promise` instance. |

## Examples

```ts
assertPromise(Promise.resolve(1)); // passes
```
