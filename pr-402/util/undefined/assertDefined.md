# assertDefined()

- Kind: function
- Import: `import { assertDefined } from "shelving/util/undefined";`

Assert that a value is not `undefined`.

## Signatures

```ts
assertDefined(value: T | undefined, caller: AnyCaller = assertDefined): asserts value is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `T \| undefined` | The value to assert is defined. |
| `caller` | `AnyCaller` | Function to attribute the thrown error to (defaults to `assertDefined`). Defaults to `assertDefined`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is T` |  |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if the value is `undefined`. |
