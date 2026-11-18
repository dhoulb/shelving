# TABLE_RULE

- Kind: constant
- Import: `import { TABLE_RULE } from "shelving/markup";`

Table.
- Markdown-style pipe table: a header row, a `|---|` delimiter row, then body rows.
- Cells are pipe-separated; outer pipes are optional and whitespace around cells is trimmed.
- Extra `|---|` delimiter rows split the table into sections: the first section becomes `<thead>`, the last becomes `<tfoot>` (only when there are three or more sections), and every section in between becomes its own `<tbody>`.
- Column count and per-column alignment (`:--` left, `--:` right, `:-:` centered) come from the first delimiter row; ragged rows are padded or truncated to that count.
- Cell content is rendered as inline markup; write `\|` for a literal pipe inside a cell.

## Examples

```ts
new MarkupParser({ rules: [TABLE_RULE] }).parse("| A | B |\n|---|---|\n| 1 | 2 |")
```
