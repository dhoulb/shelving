# getSpaceClass

The `space` variant prop sets a block-level element's `margin-block` (top + bottom) from the spacing scale — `<Section space="large">`, `<Paragraph space="none">`. It's an **override** for one-off spacing; for an app-wide change, retune the spacing variables below in a theme file.

`getSpaceClass({ space })` maps the prop to a margin class (e.g. `space="large"` → `large`). The same scale also backs `getPaddingClass()` (block padding), `getIndentClass()` (inline padding), and `getGapClass()`, so they all move together when you change `--space-normal`.

Alongside the named scale, `space`, `padding`, and `indent` also accept numeric multiples of `--space-normal` — `1x` … `10x` (e.g. `padding="5x"` → `calc(var(--space-normal) * 5)`) — for larger one-off blocks like hero panels.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

### Scale

| Variable | Default | Notes |
|---|---|---|
| `--space-xxsmall` | `var(--space-normal) * 0.25` | 4px |
| `--space-xsmall` | `var(--space-normal) * 0.5` | 8px |
| `--space-small` | `var(--space-normal) * 0.75` | 12px |
| `--space-normal` | 1rem | 16px - base spacing unit (the root of the scale). |
| `--space-large` | `var(--space-normal) * 1.5` | 24px |
| `--space-xlarge` | `var(--space-normal) * 2` | 32px |
| `--space-xxlarge` | `var(--space-normal) * 3` | 48px |

### Semantic

| Variable | Default | Used for |
|---|---|---|
| `--space-section` | `var(--space-normal) * 2` | Top margin for titles / headings / section blocks. |
| `--space-paragraph` | `var(--space-normal)` | Default block-space for most prose elements. |
