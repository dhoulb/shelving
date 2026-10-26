# assertPlainObject()

- Kind: function
- Import: `import { assertPlainObject } from "shelving/util/object";`

Assert that an unknown value is a plain object.

## Signatures

```ts
assertPlainObject(value: unknown): asserts value is ImmutableObject
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
| `RequiredError` | If `value` is not a plain object. |
