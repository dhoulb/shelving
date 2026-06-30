# LoadingIcon

An animated SVG spinner shaped like a Heroicon — a faint full track plus a rotating indicator arc. It takes only `className`, so it behaves like any other icon and is meant to be styled by `<Icon>`.

**Things to know:**

- The track and indicator paint from scaled steps of the current tint ladder (`--tint-70` / `--tint-80`), so the faint track and brighter indicator both follow whatever tint `<Icon>` (or an ancestor) sets, correctly shaded.
- The spin is driven by an inline SMIL `<animateTransform>`, so it needs no CSS to animate.
- Feed it to `<Icon>` to size, colour, and centre it: `<Icon icon={LoadingIcon} size="large" status="loading" />`. `<Icon status="loading">` already uses it automatically.
- `LOADING` is a pre-keyed `<Icon icon={LoadingIcon} />` element with a stable `key` — drop it straight into `Suspense` fallbacks and lists to avoid unnecessary reconciliation overhead.

## Usage

```tsx
import { Icon, LOADING, LoadingIcon } from "shelving/ui";

// Styled through <Icon>, like any other icon.
<Icon icon={LoadingIcon} size="large" />

// <Icon status="loading"> uses it for you.
<Icon status="loading" />

// Pre-keyed constant for fallbacks and lists.
<Suspense fallback={LOADING}>
  <SlowComponent />
</Suspense>

{busy ? LOADING : children}
```

## Styling

Size, centring, and overall colour come from wrapping it in `<Icon>` — its `--icon-color` / `--icon-size` hooks and `color` / `status` / `size` / `tint` variants drive the spinner (see the `Icon` Styling section). On top of that, the two arcs expose their own hooks:

| Variable | Styles | Default |
|---|---|---|
| `--loading-icon-track` | Track (background arc) stroke | `var(--tint-70)` |
| `--loading-icon-indicator` | Indicator (moving arc) stroke | `var(--tint-80)` |
| `--loading-icon-stroke-width` | Stroke width of both arcs | `2.5` |
| `--loading-icon-length` | `stroke-dasharray` of the indicator arc | `28 100` |

**Global tokens it reads** — the tint-ladder steps `--tint-70` / `--tint-80` for the arc strokes (rebound by the `color` / `status` / `tint` variants on the wrapping `<Icon>`).
