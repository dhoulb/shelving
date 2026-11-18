# assertFunction()

- Kind: function
- Import: `import { assertFunction } from "shelving/util/function";`

Assert that a value is a function.

## Signatures

```ts
assertFunction(value: unknown): asserts value is AnyFunction
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is AnyFunction` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not a function. |
