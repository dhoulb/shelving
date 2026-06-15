# Table

A data table — renders a `<table>`. Compose the usual `<thead>` / `<tbody>` / `<tfoot>`, `<tr>`, `<th>`, and `<td>` markup inside it; the component supplies the spacing, borders, and label typography.

**Things to know:**

- The `<table>` element itself draws no borders — the `<th>` / `<td>` cells do. Header (`<thead>`) and footer (`<tfoot>`) cells render in the smaller, uppercase label style.
- First and last cells in a row drop their outer inline padding so the table aligns flush with the surrounding text column.
- Wrap a wide table in a horizontally scrollable container if it may exceed the content width on small screens.
- Like the other block components it collapses its outer block margin when it is the first or last child.
- Inside [`Prose`](/ui/Prose) a raw `<table>` picks up the same styling, so Markdown-rendered tables match component ones.

## Usage

### Basic table

```tsx
import { Table } from "shelving/ui";

<Table>
  <thead>
    <tr><th>Name</th><th>Plan</th></tr>
  </thead>
  <tbody>
    <tr><td>Alice</td><td>Pro</td></tr>
    <tr><td>Bob</td><td>Free</td></tr>
  </tbody>
</Table>
```

## Styling

`Table` exposes hooks for its rhythm, cell padding, and border; it paints no surface of its own, so it inherits the surrounding tint.

| Variable | Styles | Default |
|---|---|---|
| `--table-space` | Outer block margin (top + bottom) | `var(--space-paragraph)` (16px) |
| `--table-padding` | Cell padding (block + inline) | `var(--space-xsmall)` |
| `--table-border` | Cell border shorthand | `var(--table-stroke)` |
| `--table-stroke` | Cell border thickness/colour | `var(--stroke-normal) solid var(--tint-80)` |
| `--table-header-weight` | Weight of `<thead>` / `<tfoot>` / `<tbody> <th>` cells | `var(--weight-strong)` |
| `--table-label-font` | Label font for `<thead>` / `<tfoot>` `<th>` | `var(--font-label)` |
| `--table-label-weight` | Label weight | `var(--weight-label)` |
| `--table-label-size` | Label size | `var(--size-label)` |
| `--table-label-case` | Label letter case | `var(--case-label)` |
| `--table-label-color` | Label colour | `var(--tint-70)` |

**Global tokens it reads:** `--space-paragraph`, `--space-xsmall`, `--stroke-normal`, the tint-ladder steps `--tint-70` / `--tint-80`, and the label tokens `--font-label` / `--weight-label` / `--size-label` / `--case-label` / `--weight-strong`.

## See also

- [`Definitions`](/ui/Definitions) — term/value pairs when a two-column key/value layout fits better than a grid.
- [`Prose`](/ui/Prose) — styles raw `<table>` inside longform content.
- [`ui`](/ui) — the styling system: tint ladder, label tokens, and theming.
