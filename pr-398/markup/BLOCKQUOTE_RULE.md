# BLOCKQUOTE_RULE

- Kind: constant
- Import: `import { BLOCKQUOTE_RULE } from "shelving/markup";`

Blockquote block.
- `>` quote character followed by zero or more spaces.
- No spaces can appear before the `>` quote character.
- Quote block is only broken by `\n\n` two newline characters.
- Nesting is capped at `MAX_DEPTH` (10) levels; deeper `>` prefixes are rendered as plain text rather than recursed, so pathological input can't overflow the stack.

## Examples

```ts
new MarkupParser({ rules: [BLOCKQUOTE_RULE] }).parse("> Quoted text")
```
