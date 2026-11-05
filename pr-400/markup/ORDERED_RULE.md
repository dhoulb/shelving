# ORDERED_RULE

- Kind: constant
- Import: `import { ORDERED_RULE } from "shelving/markup";`

Ordered list.
- Line starting with number, followed by `.`, `)` or `:` character, then one or more space characters.
- No spaces can appear before the number character.
- Second-level list can be created by indenting with `\t` one tab.
- List block runs until a blank line that is not followed by another item or an indented continuation line.
- A list with blank lines between its items (or before a continuation paragraph) is "loose": its items are wrapped in `<p>` tags.
- Sparse lists are not supported.

## Examples

```ts
new MarkupParser({ rules: [ORDERED_RULE] }).parse("1. First\n2. Second")
```
