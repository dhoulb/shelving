# getStrokeClass

This module's main job is to **define and document the border-thickness design tokens**. Components don't take a `stroke` prop — they hard-code to these tokens and expose their own per-component hooks (`--button-stroke`, `--card-border`, …) for overrides. `getStrokeClass({ stroke })` exists as a utility (e.g. `stroke="thick"` → `stroke-thick`) and as the home for this documentation.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

| Variable | Default | Used for |
|---|---|---|
| `--stroke` | `2px` | Base border thickness — the root of the scale. |
| `--stroke-normal` | `calc(var(--stroke) * 1)` | Default borders. |
| `--stroke-thick` | `calc(var(--stroke) * 1.5)` | Heavier borders. |
| `--stroke-focus` | `var(--stroke-thick)` | Focus-outline thickness. |

## See also

- [`getRadiusClass`](/ui/getRadiusClass) — corner-radius tokens.
- [`getShadowClass`](/ui/getShadowClass) — drop-shadow tokens.
- [`ui`](/ui) — the styling-system overview and the full list of base token pages.
