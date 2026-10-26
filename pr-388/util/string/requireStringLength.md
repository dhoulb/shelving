# requireStringLength()

- Kind: function
- Import: `import { requireStringLength } from "shelving/util/string";`

Convert a possible string to a string with min/max length, or throw `RequiredError` if conversion fails.

## Signatures

```ts
requireStringLength(value: PossibleString, min?: number, max?: number, caller: AnyCaller = requireString): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleString` | The value to convert. |
| `min` | `number` | The minimum allowed length. Optional. |
| `max` | `number` | The maximum allowed length. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireString`). Defaults to `requireString`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The string representation of `value`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` cannot be converted to a string within the length bounds. |

## Examples

```ts
requireStringLength("abc", 1, 5) // "abc"
```
