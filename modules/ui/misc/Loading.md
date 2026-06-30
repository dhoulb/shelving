# Loading

An animated SVG spinner used as a loading indicator. Self-contained inline SVG with a rotating indicator arc that shares `<Icon>`'s styling, so it sizes, colours, and centres like any other icon.

**Things to know:**

- Shares `Icon.module.css` with `<Icon>` and accepts the same styling variants — `color`, `status`, `space`, `size`, and `tint` — but not the `icon` prop, since the spinner is its own fixed graphic.
- Size it via the `size` prop (or `--icon-size`); defaults to `--size-icon` (1.5rem). It centres itself with `margin-inline: auto`, and resets to `margin: 0` inside a `<Flex>` so `gap` controls spacing.
- The track and indicator arcs paint from the tint ladder (`--tint-70` / `--tint-80`), so `color`/`status`/`tint` variants flow through to the spinner colours.
- `LOADING` is a pre-keyed `<Loading />` element with a stable `key` — drop it straight into `Suspense` fallbacks and lists to avoid unnecessary reconciliation overhead.

## Usage

```tsx
import { Loading, LOADING } from "shelving/ui";

<Loading />
<Loading size="large" status="info" />

// Pre-keyed constant for fallbacks and lists.
<Suspense fallback={LOADING}>
  <SlowComponent />
</Suspense>

{busy ? LOADING : children}
```

## Styling

`<Loading>` reuses `<Icon>`'s `.icon` class, so its box (size, centring, `--icon-color`, `--icon-size`) is themed through the same hooks. See the `Icon` Styling section for those. On top of that, the spinner arcs expose:

| Variable | Styles | Default |
|---|---|---|
| `--loading-color` | Track (background arc) stroke | `var(--tint-70)` |
| `--loading-fill` | Indicator (moving arc) stroke | `var(--tint-80)` |
| `--loading-stroke-width` | Stroke width of both arcs | `2.5` |
| `--loading-indicator-length` | `stroke-dasharray` of the indicator arc | `28 100` |

**Global tokens it reads** — `--icon-color` / `--icon-size` and the size tokens (via the shared `.icon` class), plus the tint-ladder steps `--tint-70` / `--tint-80` for the arc strokes.
