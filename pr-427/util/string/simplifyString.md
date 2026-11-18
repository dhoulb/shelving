# simplifyString()

- Kind: function
- Import: `import { simplifyString } from "shelving/util/string";`

Simplify a string by removing anything that isn't a number, letter, or space.
- Useful when you're running a query against a string entered by a user, or making a slug from a title.
- Uses `NFKD` normalisation to convert styled letters to plain letters, e.g. circled `Ⓒ`, italic `𝐶`, script `𝒞`, fraktur `ℭ`, double-struck `ℂ`, fullwidth `Ｃ`, and superscript `ᶜ` all become `c`.
- `NFKD` also splits ligatures (e.g. `ﬀ` becomes `ff`) and removes accents (e.g. `é` becomes `e`).
- Converts a small set of letterlike characters that `NFKD` does not cover: small capitals (e.g. `ᴄ`), negative circled and squared letters (e.g. `🅒` and `🅲`), regional indicators (e.g. `🇨`), and the estimate symbol `℮`.
- Keeps letters from other scripts (e.g. `ж`, `π`, `ℵ` alef becomes `א`), and does not convert them to Latin letters that look the same.
- Removes symbols, punctuation, and emoji (e.g. `©`, `!`, `😂`).
- Removes marks that annotate text (`™`, `℠`, `🅪`, `🅫`, `🅬`), so `Acme™` becomes `acme`, not `acmetm`.
- Keeps the letters of units and abbreviations, because they are part of the meaning (e.g. `㎏` becomes `kg`, `№` becomes `no`, `℃` becomes `c`).
- Converts runs of spaces, tabs, newlines, underscores, and dashes to a single space, then trims and lowercases the result.

## Signatures

```ts
simplifyString(str: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to simplify. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The simplified, lowercased string containing only numbers, letters, and single spaces. |
