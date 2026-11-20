# sanitizeWord()

- Kind: function
- Import: `import { sanitizeWord } from "shelving/util/string";`

Sanitize a single word of text.
- Used when you're sanitising a value that can never contain whitespace, e.g. an email address or token.
- Remove all control characters (like `sanitizeText()`).
- Strip all whitespace entirely (rather than collapsing runs to a single space like `sanitizeText()`).

## Signatures

```ts
sanitizeWord(str: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to sanitize. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The sanitized single-word string. |

## Examples

```ts
sanitizeWord("\x00 a b c "); // Returns `"abc"`
```
