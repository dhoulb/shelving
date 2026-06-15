# getColorClass

The `color` variant prop moves the [tint ladder](/ui/TINT_CLASS) anchor to a named palette colour — `<Card color="red">`, `<Tag color="primary">`. It's an **override** for one-off recolouring of a component in a page; for an app-wide look, override the palette variables below in a theme file instead.

`getColorClass({ color })` returns `getClass(TINT_CLASS, "<colour>")` — it moves `--tint-50` to the chosen colour and recomposes the ladder, so the whole subtree retints. See [`TINT_CLASS`](/ui/TINT_CLASS) for how the ladder works.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app. Override a palette colour to re-aim every variant and status that maps to it.

### Palette

| Variable | Default | Notes |
|---|---|---|
| `--color-gray` | `oklch(60% 0.01 240)` | Neutral anchor — also the default tint when nothing moves it. |
| `--color-red` | `oklch(62% 0.2 30)` | |
| `--color-orange` | `oklch(74% 0.157 60)` | |
| `--color-yellow` | `oklch(86% 0.16 92)` | |
| `--color-green` | `oklch(72% 0.185 130)` | |
| `--color-aqua` | `oklch(72% 0.121 185)` | |
| `--color-blue` | `oklch(57% 0.216 260)` | |
| `--color-purple` | `oklch(58% 0.25 300)` | |
| `--color-pink` | `oklch(68% 0.239 350)` | |

### Semantic

| Variable | Default | Used for |
|---|---|---|
| `--color-link` | `var(--color-blue)` | Link colour. |
| `--color-focus` | `var(--color-blue)` | Focus outlines. |
| `--color-success` | `var(--color-green)` | `status="success"`. |
| `--color-warning` | `var(--color-orange)` | `status="warning"`. |
| `--color-failure` | `var(--color-red)` | `status="error"` / `status="danger"`. |

### Brand

| Variable | Default | Used for |
|---|---|---|
| `--color-primary` | `var(--color-blue)` | `color="primary"`. |
| `--color-secondary` | `var(--color-purple)` | `color="secondary"`. |
| `--color-tertiary` | `var(--color-pink)` | `color="tertiary"`. |

## See also

- [`TINT_CLASS`](/ui/TINT_CLASS) — the tint ladder these colours feed, and the full theming guide.
- [`getStatusClass`](/ui/getStatusClass) — the semantic-status sibling of `color`.
- [`ui`](/ui) — the styling-system overview and the full list of base token pages.
