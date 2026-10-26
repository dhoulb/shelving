# PARAGRAPH_RULE

- Kind: constant
- Import: `import { PARAGRAPH_RULE } from "shelving/markup";`

Paragraph.
- Captures almost anything in a block context.
- Any run of non-whitespace.
- Leading and trailing whitespace is trimmed.

## Examples

```ts
new MarkupParser({ rules: [PARAGRAPH_RULE] }).parse("Some plain text")
```
