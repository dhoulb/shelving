# assertFalse()

- Kind: function
- Import: `import { assertFalse } from "shelving/util/boolean";`

Assert that an unknown value is exactly `false`.

## Signatures

```ts
assertFalse(value: unknown, caller: AnyCaller = assertFalse): asserts value is false
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertFalse` itself). Defaults to `assertFalse`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is false` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not the literal `false`. |
