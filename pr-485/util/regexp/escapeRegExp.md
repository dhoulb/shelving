# escapeRegExp()

- Kind: function
- Import: `import { escapeRegExp } from "shelving/util/regexp";`

Escape special characters in a string regular expression.
- Escapes any characters that have special meaning in a regular expression so the string matches literally.
- Uses native `RegExp.escape()` where it exists, and a simpler pattern where it does not.
- The escaped string can be different in each environment, but the regular expression always matches the same text.

## Signatures

```ts
escapeRegExp(pattern: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `pattern` | `string` | The string to escape. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The escaped string, safe to use as a literal regular expression source. |
