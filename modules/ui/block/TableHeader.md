# TableHeader

A table header cell — renders a `<th>`. Use it for the header row of a [`Table`](/ui/Table); it sets the column's width and label typography.

**Things to know:**

- Set the column's width with the `width` variant — `width="fit"` hugs the content. Because a cell (unlike a `<col>`) honours `min-width`, `width="12x" grow` gives the column a *hard* minimum it can grow past, so the table scrolls rather than collapsing the column on a narrow screen. See [`getWidthClass`](/ui/getWidthClass).
- A column's width is the widest of its cells, so sizing the `<th>` sizes the whole column — set the width once on the header instead of on every body cell.
- Carries the same [typography variants](/ui/getTypographyClass) as the prose components (`size`, `weight`, `font`, `tint`, alignment), though the [`<Table>`](/ui/Table) already styles header cells in the label style by default.
- For a column that has no header, set the width on its [`TableCell`](/ui/TableCell)s instead.

## Usage

```tsx
import { Table, TableCell, TableHeader } from "shelving/ui";

<Table>
  <thead>
    <tr>
      <TableHeader width="fit">Parameter</TableHeader>
      <TableHeader width="fit">Type</TableHeader>
      <TableHeader width="12x" grow>Description</TableHeader>
    </tr>
  </thead>
  <tbody>
    <tr>
      <TableCell>name</TableCell>
      <TableCell>string</TableCell>
      <TableCell>The name of the thing.</TableCell>
    </tr>
  </tbody>
</Table>
```

## Styling

`TableHeader` paints nothing of its own — it composes the [`width`](/ui/getWidthClass) and [`typography`](/ui/getTypographyClass) variants onto a `<th>`, and inherits the header styling (label font, borders, padding) from the surrounding [`Table`](/ui/Table). It exposes no hooks of its own.
