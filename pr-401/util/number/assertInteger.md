# assertInteger()

- Kind: function
- Import: `import { assertInteger } from "shelving/util/number";`

Assert that a value is an integer (optionally within specified min/max values).

## Signatures

```ts
assertInteger(value: unknown, min?: number, max?: number, caller: AnyCaller = assertInteger): asserts value is number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |
| `min` | `number` | Minimum allowed value, inclusive. Optional. |
| `max` | `number` | Maximum allowed value, inclusive. Optional. |
| `caller` | `AnyCaller` | Function used to attribute a thrown error to the calling site. Defaults to `assertInteger`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is number` | Nothing; narrows `value` to `number`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if `value` is not an integer within range. |
