# SEPARATOR_RULE

- Kind: constant
- Import: `import { SEPARATOR_RULE } from "shelving/markup";`

Separator (horizontal rule / thematic break).
- Same as Markdown syntax but also allows `•` bullet character (in addition to `-` dash, `+` plus, `*` asterisk, `_` underscore).
- Character must be repeated three (or more) times.
- Character must be the same every time (can't mix)
- Might have infinite number of spaces between the characters.

## Examples

```ts
new MarkupParser({ rules: [SEPARATOR_RULE] }).parse("---")
```
