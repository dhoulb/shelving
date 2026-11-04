# UNORDERED_RULE

- Kind: constant
- Import: `import { UNORDERED_RULE } from "shelving/markup";`

Unordered list.
- Line starting with `-`, `*`, `•`, or `+` character followed by one or more space characters.
- No spaces can appear before the bullet character.
- Second-level list can be created by indenting with `\t` one tab.
- List block runs until a blank line that is not followed by another item or an indented continuation line.
- A list with blank lines between its items (or before a continuation paragraph) is "loose": its items are wrapped in `<p>` tags.
- An item starting with `[ ]` or `[x]` (case-insensitive) is a todo item: a checkbox `<input>` plus the content wrapped in a `<label>` so clicking it toggles the checkbox.
- Sparse lists are not supported.

## Examples

```ts
new MarkupParser({ rules: [UNORDERED_RULE] }).parse("- First\n- Second")
```
