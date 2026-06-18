# Notice

A block-level status callout with an icon and message, used to highlight feedback. Rendered as an `<aside>` with a status icon and a message, mapping its `status` to the appropriate colour and ARIA role.

**Things to know:**

- Shows a [`<StatusIcon>`](/ui/StatusIcon) for the current `status` by default; pass `icon` to override, or `false` / `null` to hide it.
- Sets an ARIA `role` of `"alert"` for `error` / `danger` statuses, otherwise `"status"`.
- [`LOADING_NOTICE`](/ui/LOADING_NOTICE) is a shared `<Notice status="loading" />` element ready to drop into `Suspense` fallbacks.

## Usage

```tsx
import { Notice } from "shelving/ui";

<Notice status="success">Your changes have been saved.</Notice>
<Notice status="error">Something went wrong.</Notice>
<Notice status="loading" />
```

```tsx
import { LOADING_NOTICE } from "shelving/ui";

<Suspense fallback={LOADING_NOTICE}>
  <SlowPanel />
</Suspense>
```

## Styling

`Notice` paints from the [tint ladder](/ui/TINT_CLASS); override these hooks at `:root` (or any ancestor scope) to retheme. Move `--notice-tint` to recolour everything at once.

| Variable | Styles | Default |
|---|---|---|
| `--notice-tint` | Tint anchor for the notice scope | `inherit` (flows from `color=` / `status=` / parent) |
| `--notice-background` | Surface fill | `var(--tint-90)` |
| `--notice-color` | Text colour | `var(--tint-50)` |
| `--notice-border` | Border shorthand | `var(--notice-stroke) solid var(--tint-80)` |
| `--notice-stroke` | Border thickness | `var(--stroke-normal)` (2px) |
| `--notice-radius` | Corner radius | `var(--radius-xsmall)` |
| `--notice-padding` | Inner padding | `var(--space-small)` |
| `--notice-space` | Outer block margin (top + bottom) | `var(--space-paragraph)` |
| `--notice-size` | Font size | `var(--size-normal)` |
| `--notice-weight` | Font weight | `var(--weight-strong)` |

**Global tokens it reads** — the tint ladder [`--tint-50`](/ui/TINT_CLASS) / [`--tint-80`](/ui/TINT_CLASS) / [`--tint-90`](/ui/TINT_CLASS), plus [`--space-paragraph`](/ui/getSpaceClass), [`--space-small`](/ui/getSpaceClass), [`--radius-xsmall`](/ui/getRadiusClass), [`--stroke-normal`](/ui/getStrokeClass), [`--size-normal`](/ui/getSizeClass), and [`--weight-strong`](/ui/getWeightClass).

## See also

- [`Notices`](/ui/Notices) — the global list that renders incoming notices as `<Notice>` elements.
- [`StatusIcon`](/ui/StatusIcon) — the default icon shown for the notice's status.
- [`notify`](/ui/notify) — dispatch notices into the global `<Notices>` list.
- [`shelving/ui`](/ui) — the styling system: tint ladder, cascade layers, and theming.
