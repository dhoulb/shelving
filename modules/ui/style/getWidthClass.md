# getWidthClass

The `width` variant prop sets a component's inline-size — `<Card width="narrow">`, `<Block width="wide">`, `<Cell width="narrow">`. It's an **override** for one-off layout; for an app-wide change, retune the width variables below in a theme file. `<Section>` already defaults to the `--width-normal` width, so most pages never set `width` at all.

`getWidthClass({ width, grow })` maps the props to a width class. Every value is capped at 100% of the container.

**Values:**

- `narrow` / `normal` / `wide` — fixed widths from the variables below.
- `full` — the full available width.
- `fit` — shrink to the content's intrinsic width (`fit-content`).
- `1x` / `2x` / `3x` / `4x` / `5x` / `6x` / `7x` / `8x` / `10x` / `12x` / `16x` / `20x` / `24x` / `28x` / `32x` — fixed multiples of `--space-normal` (no per-step variables; calculated directly).

**The `grow` flag** turns the chosen `width` into a floor rather than an exact size: it applies the value as `min-inline-size` and adds `flex-grow: 1`, so the element expands to fill the available space when it's a flex item. Set it on a `<Cell>` (`width="12x" grow`) to give that column a 192px minimum that absorbs the remaining width and keeps the table from collapsing the column on a narrow viewport — cells honour `min-width`, so the table scrolls instead.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

| Variable | Default | Used for |
|---|---|---
| `--width-narrow` | `36rem` | Focused single-purpose column, e.g. forms and login pages. |
| `--width-normal` | `48rem` | Standard content column. |
| `--width-wide` | `80rem` | Full dashboard-style content. |
