# CollapseTransition

A `<Transition>` preset that collapses its children in and out by animating their size, clipping the overflow during the animation.

**Things to know:**

- Uses the `collapse` transition class — there is no direction-aware variant, so forward and back animate identically.
- Pass `overlay` to raise the transition group above surrounding content during the animation (`z-index: 100`).
- When pieces of content take turns in the same box and animate in and out (for example tabs, each with its own enter and exit), give that box `contain: paint`. Without it, iOS Safari does not repaint the place where the old content was when the new content is shorter. The part of the old content below the new content then stays on screen until the transition ends. This component is not a box of its own, so set it on the element around it.
- Under `prefers-reduced-motion: reduce` the collapse animation is disabled entirely — the size morph is positional movement, so the content swap happens as an instant cut (the DOM update still applies).

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

This preset exposes no own `--collapse-transition-*` hooks. Its `CollapseTransition.module.css` only sets `overflow: hidden` on `::view-transition-image-pair(.collapse)` so the collapsing content is clipped.

**Global tokens it reads** — none.
