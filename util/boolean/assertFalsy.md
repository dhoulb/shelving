# assertFalsy()

- Kind: function
- Import: `import { assertFalsy } from "shelving/util/boolean";`

Assert that an unknown value is falsy.

## Signatures

```ts
assertFalsy(value: unknown, caller: AnyCaller = assertFalsy): asserts value is false
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertFalsy` itself). Defaults to `assertFalsy`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is false` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is truthy. |
