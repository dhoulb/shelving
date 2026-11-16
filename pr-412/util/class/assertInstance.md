# assertInstance()

- Kind: function
- Import: `import { assertInstance } from "shelving/util/class";`

Assert that a value is an instance of something.

## Signatures

```ts
assertInstance(value: unknown, type: Class<T>): asserts value is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |
| `type` | `Class<T>` | The class `value` must be an instance of. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is T` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not an instance of `type`. |
