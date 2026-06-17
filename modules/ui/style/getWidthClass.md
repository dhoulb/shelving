# getWidthClass

The `width` variant prop sets a component's inline-size — `<Card width="narrow">`, `<Block width="wide">`, `<TableColumn width="12x">`. It's an **override** for one-off layout; for an app-wide change, retune the width variables below in a theme file. `Section` already defaults to the `--width-normal` width, so most pages never set `width` at all.

`getWidthClass({ width, grow })` maps the props to a width class. Every value is capped at 100% of the container.

**Values:**

- `narrow` / `normal` / `wide` — fixed widths from the variables below.
- `full` — the full available width.
- `fit` — shrink to the content's intrinsic width (`fit-content`).
- `1x` … `128x` — exact widths that are multiples of [`--space-normal`](/ui/getSpaceClass) (16px), following the spacing scale: `1x`–`8x` in single steps, then `10x`/`12x`/`14x`/`16x`, `20x`/`24x`/`28x`/`32x`, then `40x` … `128x` in eights. So `12x` is 192px.

**The `grow` flag** turns the chosen `width` into a floor rather than an exact size: it applies the value as `min-inline-size` and adds `flex-grow: 1`, so the element expands to fill the available space when it's a flex item. Apply it to a **table cell** (`<td className={getWidthClass({ width: "12x", grow: true })}>`) to give that column a 192px minimum that absorbs the remaining width and keeps the table from collapsing the column on a narrow viewport — note that `min-width` is ignored on a `<col>`, so `grow` belongs on the cells, not on [`TableColumn`](/ui/TableColumn).

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

| Variable | Default | Used for |
|---|---|---|
| `--width-narrow` | `35rem` | The `narrow` constraint — single-column forms, dialogs. |
| `--width-normal` | `55rem` | The `normal` constraint — standard content column. |
| `--width-wide` | `75rem` | The `wide` constraint — readable prose measure. |

## See also

- [`ui`](/ui) — the styling-system overview and the full list of base token pages.
