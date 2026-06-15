# Tag

A small inline label used to annotate other content. Accepts a status variant or a raw colour, and can be static or interactive depending on whether `href` / `onClick` is set.

**Things to know:**

- Delegates to `<Clickable>` — renders as `<a>` when `href` is set, otherwise `<button>`.
- Accepts a status variant (`success`, `info`, `error`, etc.) _or_ a raw colour (`color="red"`, `color="purple"`, etc.). Use `status` for semantic meaning and `color` for purely decorative differentiation.
- Composes status, colour, and typography styling variants.

## Usage

```tsx
import { Tag } from "shelving/ui";

<Tag success>Active</Tag>
<Tag warning href="/billing">Overdue</Tag>
<Tag color="purple" size="small">Beta</Tag>
```

## Styling

`Tag` paints from the [tint ladder](/ui/TINT_CLASS); override these hooks at `:root` (or any ancestor scope) to retheme. Move `--tag-tint` to recolour the whole tag at once.

| Variable | Styles | Default |
|---|---|---|
| `--tag-tint` | Tint anchor for the tag scope | `inherit` (flows from `color=` / `status=` / parent) |
| `--tag-background` | Surface fill | `var(--tint-50)` |
| `--tag-hover-background` | Surface fill when an interactive tag is hovered | `var(--tint-55)` |
| `--tag-color` | Text colour | `var(--tint-100)` |
| `--tag-padding` | Inner padding | `0 var(--space-xxsmall)` |
| `--tag-border` | Border shorthand | `0` |
| `--tag-radius` | Corner radius | `var(--radius-xxsmall)` |
| `--tag-font` | Font family | `var(--font-body)` |
| `--tag-size` | Font size | `var(--size-small)` |
| `--tag-weight` | Font weight | `var(--weight-strong)` |
| `--tag-leading` | Line height | `var(--leading)` |
| `--tag-case` | Text transform | `var(--case-label)` |
| `--tag-focus-border` | Focus outline | `var(--stroke-focus) solid var(--color-focus)` |

**Global tokens it reads** — the tint ladder `--tint-50` / `--tint-55` / `--tint-100`, plus `--space-xxsmall`, `--radius-xxsmall`, `--font-body`, `--size-small`, `--weight-strong`, `--leading`, `--case-label`, `--stroke-normal`, `--stroke-focus`, and `--color-focus`.

## See also

- [`StatusIcon`](/ui/StatusIcon) — pairs a status with its matching icon.
- [`Notice`](/ui/Notice) — block-level status callout sharing the same status vocabulary.
- [`ui`](/ui) — the styling system: tint ladder, cascade layers, and theming.
