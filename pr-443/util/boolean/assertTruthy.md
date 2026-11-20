# assertTruthy()

- Kind: function
- Import: `import { assertTruthy } from "shelving/util/boolean";`

Assert that an unknown value is truthy.

## Signatures

```ts
assertTruthy(value: unknown, caller: AnyCaller = assertTruthy): asserts value is true
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertTruthy` itself). Defaults to `assertTruthy`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is true` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is falsey. |
