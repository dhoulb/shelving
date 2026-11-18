# assertData()

- Kind: function
- Import: `import { assertData } from "shelving/util/data";`

Assert that an unknown value is a data object.

## Signatures

```ts
assertData(value: unknown, caller: AnyCaller = assertData): asserts value is Data
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |
| `caller` | `AnyCaller` | The function to attribute a thrown error to (defaults to `assertData`). Defaults to `assertData`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is Data` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If the value is not a plain data object. |
