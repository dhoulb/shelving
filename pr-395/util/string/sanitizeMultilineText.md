# sanitizeMultilineText()

- Kind: function
- Import: `import { sanitizeMultilineText } from "shelving/util/string";`

Sanitize multiple lines of text.
- Used when you're sanitising a multi-line input, e.g. a description for something.
- Remove all control characters except `\n` newline.
- Normalise weird characters like paragraph separator, line separator, `\t` tab, `\r` carriage return.
- Normalise runs of whitespace to one ` ` space,
- Normalise indentation to tabs (four or more spaces are a tab, three or fewer spaces are removed).
- Allow spaces at the start of each line (for indentation) but trim the end of each line.
- Trim excess newlines at the start and end of the string and runs of more than two newlines in a row.

## Signatures

```ts
sanitizeMultilineText(str: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to sanitize. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The sanitized multi-line string. |
