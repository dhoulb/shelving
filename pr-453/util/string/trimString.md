# trimString()

- Kind: function
- Import: `import { trimString } from "shelving/util/string";`

Trim a string (as a function, so it can be used in mapping).

## Signatures

```ts
trimString(str: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to trim. |

## Returns

| Type | Description |
| --- | --- |
| `string` | `str` with whitespace trimmed from both ends. |

## Examples

```ts
["  a  ", " b "].map(trimString) // ["a", "b"]
```
