# TableColumn

A table column — renders a `<col>`. Drop a `<colgroup>` of `TableColumn`s at the top of a [`Table`](/ui/Table), one per column, to set each column's width with the `width` variant.

**Things to know:**

- `TableColumn` carries no content; it only sizes the column it maps to. The order of `TableColumn`s in the `<colgroup>` matches the order of the columns.
- `width="fit"` shrinks a column to its content. An exact numeric `width` (e.g. `width="12x"` = 192px) sets the column's preferred width.
- A `<col>` width is only a **preference** — browsers ignore `min-width` on columns and will shrink one below its width when the table is squeezed (e.g. on a narrow phone). For a *hard* minimum that survives a narrow viewport and lets the table scroll instead of collapsing, put [`grow`](/ui/getWidthClass) on the column's **cells** — `<td className={getWidthClass({ width: "12x", grow: true })}>` — not on `TableColumn`.
- All sizing comes from the shared `width` variant, so `TableColumn` reads exactly like every other component's `width` prop (minus `grow`, which is a no-op on a `<col>`).

## Usage

### Sizing a documentation-style table

```tsx
import { Table, TableColumn } from "shelving/ui";
import { getWidthClass } from "shelving/ui";

// `min-width` is ignored on a `<col>`, so the description's floor goes on its cells.
const description = getWidthClass({ width: "12x", grow: true });

<Table>
  <colgroup>
    <TableColumn width="fit" />
    <TableColumn width="fit" />
    <TableColumn width="fit" />
    <TableColumn width="12x" />
  </colgroup>
  <thead>
    <tr><th>Parameter</th><th>Type</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>name</td><td>string</td><td>-</td><td className={description}>The name of the thing.</td></tr>
  </tbody>
</Table>
```

## Styling

`TableColumn` paints nothing of its own — it only composes the [`width`](/ui/getWidthClass) variant onto a `<col>`, so it exposes no hooks. Theme its widths through the global width tokens and the spacing scale that the `width` variant reads.

**Global tokens it reads (via `width`):** [`--width-narrow`](/ui/getWidthClass) / [`--width-normal`](/ui/getWidthClass) / [`--width-wide`](/ui/getWidthClass) for the semantic widths, and [`--space-normal`](/ui/getSpaceClass) for the numeric `1x`–`128x` widths.

## See also

- [`Table`](/ui/Table) — the table the columns belong to.
- [`getWidthClass`](/ui/getWidthClass) — the full `width` / `grow` variant reference.
