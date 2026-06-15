# getFontClass

The `font` variant prop sets an element's font family — `<Code font="monospace">`, `<Heading font="title">`. It's an **override** for one-off typeface changes; for an app-wide change, point the font variables below at your own faces in a theme file.

`getFontClass({ font })` maps the prop to a font-family class (e.g. `font="title"` → `title`). The semantic faces (`--font-title`, `--font-body`, …) are aliases of the three base faces, so a theme typically only redefines `--font-sans` / `--font-serif` / `--font-monospace`.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

### Faces

| Variable | Default | Notes |
|---|---|---|
| `--font-sans` | `system-ui` | Default UI face. |
| `--font-monospace` | `ui-monospace, "SF Mono", "Consolas", "Menlo", monospace` | Code face. |
| `--font-serif` | `"Palatino", "Garamond", serif` | Serif face. |

### Semantic

| Variable | Default | Used for |
|---|---|---|
| `--font-title` | `var(--font-sans)` | Headings and titles. |
| `--font-body` | `var(--font-sans)` | Body baseline. |
| `--font-label` | `var(--font-sans)` | Labels. |
| `--font-code` | `var(--font-monospace)` | Code and preformatted text. |

### Case

| Variable | Default | Used for |
|---|---|---|
| `--case-label` | `uppercase` | `text-transform` for labels and tags. |

## See also

- [`getSizeClass`](/ui/getSizeClass) — font size.
- [`getWeightClass`](/ui/getWeightClass) — font weight.
- [`getTypographyClass`](/ui/getTypographyClass) — combines size, weight, font, alignment, and tint.
- [`ui`](/ui) — the styling-system overview and the full list of base token pages.
