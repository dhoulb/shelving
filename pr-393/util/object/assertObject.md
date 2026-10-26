# assertObject()

- Kind: function
- Import: `import { assertObject } from "shelving/util/object";`

Assert that a value is an object.

## Signatures

```ts
assertObject(value: unknown): asserts value is ImmutableObject
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is ImmutableObject` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not an `object`. |
