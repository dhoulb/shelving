# assertBoolean()

- Kind: function
- Import: `import { assertBoolean } from "shelving/util/boolean";`

Assert that an unknown value is a boolean.

## Signatures

```ts
assertBoolean(value: unknown, caller: AnyCaller = assertBoolean): asserts value is boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertBoolean` itself). Defaults to `assertBoolean`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is boolean` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not a `boolean`. |
