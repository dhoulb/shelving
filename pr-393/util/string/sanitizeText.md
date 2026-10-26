# sanitizeText()

- Kind: function
- Import: `import { sanitizeText } from "shelving/util/string";`

Sanitize a single line of text.
- Used when you're sanitising a single-line input, e.g. a title for something.
- Remove all control characters.
- Normalise runs of whitespace to one ` ` space.
- Trim whitespace from the start and end of the string.

## Signatures

```ts
sanitizeText(str: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to sanitize. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The sanitized single-line string. |
