# Cell

- Kind: component
- Import: `import { Cell } from "shelving/ui";`

Table cell.
- Rendered as `<td>` (or a `<th>` using `<Cell header>`).
- Sets its column's width via the `width` variant. Unlike a `<col>`, a cell honours `min-width`, so `width="12x" grow` gives the column a hard minimum that fills the remaining space and keeps the table from collapsing the column on a narrow viewport.
- A column's width is the widest of its cells, so use this to size a column that has no header to set the width on.
- `padding` sets the cell's top and bottom padding, and `indent` its left and right. Both override the table's `padding` / `indent`, and `indent` also overrides the zero outer padding of the first and last cells.

## Signatures

```ts
Cell({ header = false, children, className, ...props }: CellProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `CellProps` |  |
| `.header` | `boolean \| undefined` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |
