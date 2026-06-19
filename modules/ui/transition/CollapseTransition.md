# CollapseTransition

A [`<Transition>`](/ui/Transition) preset that collapses its children in and out by animating their size, clipping the overflow during the animation.

**Things to know:**

- Uses the `collapse` transition class — there is no direction-aware variant, so forward and back animate identically.
- Pass `overlay` to raise the transition group above surrounding content during the animation (`z-index: 100`).

## Usage

```tsx
import { CollapseTransition } from "shelving/ui";

function Details({ open }: { open: boolean }) {
  return open ? (
    <CollapseTransition>
      <Panel>…</Panel>
    </CollapseTransition>
  ) : null;
}
```

## Styling

This preset exposes no own `--collapse-transition-*` hooks. Its `CollapseTransition.css` only sets `overflow: hidden` on `::view-transition-image-pair(.collapse)` so the collapsing content is clipped.

**Global tokens it reads** — none.
