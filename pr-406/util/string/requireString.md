# requireString()

- Kind: function
- Import: `import { requireString } from "shelving/util/string";`

Convert a possible string to a string, or throw `RequiredError` if conversion fails.

## Signatures

```ts
requireString(value: PossibleString, caller: AnyCaller = requireString): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleString` | The value to convert. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireString`). Defaults to `requireString`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The string representation of `value`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` cannot be converted to a string. |

## Examples

```ts
requireString(123) // "123"
```
