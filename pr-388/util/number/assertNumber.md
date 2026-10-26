# assertNumber()

- Kind: function
- Import: `import { assertNumber } from "shelving/util/number";`

Assert that a value is a finite number (optionally within a specified min/max range).

## Signatures

```ts
assertNumber(value: unknown, min?: number, max?: number, caller: AnyCaller = assertNumber): asserts value is number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |
| `min` | `number` | Minimum allowed value, inclusive. Optional. |
| `max` | `number` | Maximum allowed value, inclusive. Optional. |
| `caller` | `AnyCaller` | Function used to attribute a thrown error to the calling site. Defaults to `assertNumber`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is number` | Nothing; narrows `value` to `number`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if `value` is not a finite number within range. |
