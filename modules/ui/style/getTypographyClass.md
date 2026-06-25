# getTypographyClass

The typography variant props set an element's text styling from a single helper — `<Heading font="title" size="large">`, `<Paragraph weight="strong" center>`, `<Small case="upper">`. They're **overrides** for one-off changes; for an app-wide change, retune the variables below in a theme file.

`getTypographyClass({ size, weight, font, case, tint, left, center, right, wrap, nowrap })` maps each prop to a class (e.g. `size="large"` → `size-large`, `font="title"` → `font-title`, `weight="strong"` → `weight-strong`, `case="upper"` → `case-upper`), and combines them with text alignment, tint colour, and wrapping. It supersedes the former `getFontClass()`, `getSizeClass()`, and `getWeightClass()` helpers, which were merged into this module.

The semantic faces, weights, sizes, and cases are aliases of the base values, so a theme usually only needs to move the small set of base variables.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

### Faces

| Variable | Default | Notes |
|---|---|---|
| `--font-sans` | `system-ui` | Default UI face. |
| `--font-monospace` | `ui-monospace, "SF Mono", "Consolas", "Menlo", monospace` | Code face. |
| `--font-serif` | `"Palatino", "Garamond", serif` | Serif face. |
| `--font-title` | `var(--font-sans)` | Headings and titles. |
| `--font-body` | `var(--font-sans)` | Body baseline. |
| `--font-label` | `var(--font-sans)` | Labels. |
| `--font-code` | `var(--font-monospace)` | Code and preformatted text. |

### Weights

| Variable | Default | Used for |
|---|---|---|
| `--weight-normal` | `400` | Body text. |
| `--weight-strong` | `700` | Bold / emphasis. |
| `--weight-title` | `var(--weight-strong)` | Headings and titles. |
| `--weight-body` | `var(--weight-normal)` | Body baseline. |
| `--weight-label` | `var(--weight-strong)` | Labels (`<Label>`, table/definition headers). |
| `--weight-code` | `500` | Monospace / code. |

### Sizes

| Variable | Default | Notes |
|---|---|---|
| `--size-scale` | `1.25` | Ratio between steps. |
| `--size-normal` | `1rem` | Base size — the root of the modular scale. |
| `--size-xxsmall` … `--size-xxxlarge` | `calc(var(--size-normal) * pow(var(--size-scale), n))` | Each step is the base scaled by a power of the ratio. |
| `--size-icon` | `1.5rem` | Icon box size. |
| `--size-label` | `var(--size-small)` | Label text size. |
| `--size-smaller` | `0.875em` | Relative (em) shrink — e.g. inline `<Small>`. |
| `--size-larger` | `1.5em` | Relative grow. |
| `--size-xlarger` | `2.5em` | Relative grow. |
| `--size-xxlarger` | `5em` | Relative grow. |

### Line height

| Variable | Default | Used for |
|---|---|---|
| `--leading` | `clamp(1.05em, calc(1em + 0.5rem), 1.5em)` | Default line height; paired with every font-size variant and the body baseline. |
| `--leading-normal` | `1.5` | Plain unitless line height for dense blocks. |

### Case

| Variable | Default | Used for |
|---|---|---|
| `--case-title` | `none` | `text-transform` for titles and headings. |
| `--case-body` | `none` | `text-transform` for body text and the body baseline. |
| `--case-label` | `uppercase` | `text-transform` for labels and tags. |
| `--case-code` | `none` | `text-transform` for code and preformatted text. |
