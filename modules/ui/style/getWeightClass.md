# getWeightClass

The `weight` variant prop sets an element's font weight — `<Paragraph weight="strong">`. It's an **override** for one-off emphasis; for an app-wide change, override the weight variables below in a theme file.

`getWeightClass({ weight })` maps the prop to a weight class (e.g. `weight="strong"` → `weight-strong`). The semantic weights are aliases of the two base weights, so themes usually only need to move `--weight-normal` / `--weight-strong`.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

| Variable | Default | Used for |
|---|---|---|
| `--weight-normal` | `400` | Body text. |
| `--weight-strong` | `700` | Bold / emphasis. |
| `--weight-title` | `var(--weight-strong)` | Headings and titles. |
| `--weight-body` | `var(--weight-normal)` | Body baseline. |
| `--weight-label` | `var(--weight-strong)` | Labels (`<Label>`, table/definition headers). |
| `--weight-code` | `500` | Monospace / code. |
