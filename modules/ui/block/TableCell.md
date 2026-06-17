# TableCell

A table body cell — renders a `<td>`. Use it for the body rows of a [`Table`](/ui/Table); it sets the column's width and cell typography.

**Things to know:**

- Set the column's width with the `width` variant. Because a cell (unlike a `<col>`) honours `min-width`, `width="12x" grow` gives the column a *hard* minimum that fills the remaining space and keeps the table from collapsing the column on a narrow screen — the table scrolls instead. See [`getWidthClass`](/ui/getWidthClass).
- A column's width is the widest of its cells, so this is how you size a column that has no header to set the width on (e.g. a trailing description column).
- Carries the same [typography variants](/ui/getTypographyClass) as the prose components (`size`, `weight`, `font`, `tint`, alignment).
- For a column that does have a header, prefer setting the width once on its [`TableHeader`](/ui/TableHeader).

## Usage

```tsx
import { Table, TableCell } from "shelving/ui";

<Table>
  <tbody>
    <tr>
      <TableCell>name</TableCell>
      <TableCell width="12x" grow>A longer description that should keep a sensible minimum width.</TableCell>
    </tr>
  </tbody>
</Table>
```

## Styling

`TableCell` paints nothing of its own — it composes the [`width`](/ui/getWidthClass) and [`typography`](/ui/getTypographyClass) variants onto a `<td>`, and inherits the cell styling (borders, padding) from the surrounding [`Table`](/ui/Table). It exposes no hooks of its own.

## See also

- [`TableHeader`](/ui/TableHeader) — the `<th>` equivalent for header cells.
- [`Table`](/ui/Table) — the table the cells belong to.
- [`getWidthClass`](/ui/getWidthClass) — the full `width` / `grow` variant reference.
