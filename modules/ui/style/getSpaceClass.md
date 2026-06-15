# getSpaceClass

The `space` variant prop sets a block-level element's `margin-block` (top + bottom) from the spacing scale — `<Section space="large">`, `<Paragraph space="none">`. It's an **override** for one-off spacing; for an app-wide change, retune the spacing variables below in a theme file.

`getSpaceClass({ space })` maps the prop to a margin class (e.g. `space="large"` → `large`). The same scale also backs [`getPaddingClass`](/ui/getPaddingClass) and [`getGapClass`](/ui/getGapClass), so all three move together when you change `--space`.

Alongside the named scale, `space` and `padding` also accept numeric multiples of `--space-normal` — `1x` … `10x` (e.g. `padding="5x"` → `calc(var(--space-normal) * 5)`) — for larger one-off blocks like hero panels.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

### Scale

| Variable | Default | Notes |
|---|---|---|
| `--space` | `1rem` | Base spacing unit — the root of the scale. |
| `--space-xxsmall` | `calc(var(--space) * 0.25)` | 4px |
| `--space-xsmall` | `calc(var(--space) * 0.5)` | 8px |
| `--space-small` | `calc(var(--space) * 0.75)` | 12px |
| `--space-normal` | `calc(var(--space) * 1)` | 16px |
| `--space-large` | `calc(var(--space) * 1.5)` | 24px |
| `--space-xlarge` | `calc(var(--space) * 2)` | 32px |
| `--space-xxlarge` | `calc(var(--space) * 3)` | 48px |

### Semantic

| Variable | Default | Used for |
|---|---|---|
| `--space-section` | `2rem` | Top margin for titles / headings / section blocks. |
| `--space-paragraph` | `var(--space-normal)` | Default block-space for most prose elements. |

## See also

- [`getPaddingClass`](/ui/getPaddingClass) — the `padding-block` sibling on the same scale.
- [`getGapClass`](/ui/getGapClass) — the flex/grid `gap` sibling on the same scale.
- [`ui`](/ui) — the styling-system overview and the full list of base token pages.
