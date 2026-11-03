# requireInteger()

- Kind: function
- Import: `import { requireInteger } from "shelving/util/number";`

Convert a possible number to an integer, or throw `RequiredError` if the value cannot be converted.

## Signatures

```ts
requireInteger(value: PossibleNumber, min?: number, max?: number, caller: AnyCaller = requireInteger): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleNumber` | The value to convert. |
| `min` | `number` | Minimum allowed value, inclusive. Optional. |
| `max` | `number` | Maximum allowed value, inclusive. Optional. |
| `caller` | `AnyCaller` | Function used to attribute a thrown error to the calling site. Defaults to `requireInteger`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | The integer. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if `value` cannot be converted to an integer within range. |
