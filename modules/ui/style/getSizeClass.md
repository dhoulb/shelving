# getSizeClass

The `size` variant prop sets an element's font size from the modular scale — `<Heading size="large">`, `<Small size="xsmall">`. It's an **override** for one-off sizing; for an app-wide change, retune the scale variables below in a theme file.

`getSizeClass({ size })` maps the prop to a font-size class (e.g. `size="large"` → `large`). All steps derive from `--size` and `--size-scale`, so changing those two reflows the whole ramp.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

### Scale

| Variable | Default | Notes |
|---|---|---|
| `--size` | `1rem` | Base size — the root of the modular scale. |
| `--size-scale` | `1.25` | Ratio between steps. |
| `--size-xxsmall` … `--size-xxxlarge` | `calc(var(--size) * pow(var(--size-scale), n))` | Each step is the base scaled by a power of the ratio (`--size-normal` = `var(--size)`). |

### Semantic & relative

| Variable | Default | Used for |
|---|---|---|
| `--size-icon` | `var(--size-large)` | Icon box size. |
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

## See also

- [`getWeightClass`](/ui/getWeightClass) — font weight.
- [`getFontClass`](/ui/getFontClass) — font family.
- [`getTypographyClass`](/ui/getTypographyClass) — combines size, weight, font, alignment, and tint.
- [`ui`](/ui) — the styling-system overview and the full list of base token pages.
