# requireNumber()

- Kind: function
- Import: `import { requireNumber } from "shelving/util/number";`

Convert a possible number to a finite number, or throw `RequiredError` if the value cannot be converted.

## Signatures

```ts
requireNumber(value: PossibleNumber, min?: number, max?: number, caller?: AnyCaller): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleNumber` | The value to convert. |
| `min` | `number` | Minimum allowed value, inclusive. Optional. |
| `max` | `number` | Maximum allowed value, inclusive. Optional. |
| `caller` | `AnyCaller` | Function used to attribute a thrown error to the calling site. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `number` | The finite number. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if `value` cannot be converted to a finite number within range. |
