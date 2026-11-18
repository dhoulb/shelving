# INLINE_RULE

- Kind: constant
- Import: `import { INLINE_RULE } from "shelving/markup";`

Inline strong, emphasis, insert, delete, highlight.
- Inline strong text wrapped in one or more `*` asterisks.
- Inline emphasis text wrapped in one or more `_` underscores.
- Inline inserted text wrapped in one or more `+` pluses.
- Inline deleted text wrapped in one or more `~` tildes.
- Inline highlighted text wrapped in one or more `=` equals or `:` colons.
- Whitespace cannot be the first or last character of the element (e.g. `* abc *` will not work).
- Closing chars must match opening characters.
- Cannot occur in the middle of a word (e.g. `this*that*this` will not work).
- Closing characters must exactly match opening characters.
- Different to Markdown: strong is always surrounded by `*asterisks*` and emphasis is always surrounded by `_underscores_` (strong isn't 'double emphasis').

## Examples

```ts
new MarkupParser({ rules: [INLINE_RULE] }).parse("This is *bold* and _italic_")
```
