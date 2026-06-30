# LoadingIcon

An animated SVG spinner shaped like a Heroicon — a faint full track plus a rotating indicator arc. It takes only `className`, so it behaves like any other icon and is meant to be styled by `<Icon>`.

**Things to know:**

- Both arcs paint with `currentColor`, so the spinner colour follows whatever `<Icon>` (or surrounding text) sets — the faint track is the same colour at 25% opacity.
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

`<LoadingIcon>` exposes no styling hooks of its own — it paints with `currentColor` and inherits its size from the font size, exactly like a Heroicon. Style it by wrapping it in `<Icon>`, whose `--icon-color` / `--icon-size` hooks and `color` / `status` / `size` / `tint` variants drive the spinner. See the `Icon` Styling section.
