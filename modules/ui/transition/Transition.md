# Transition

The base View Transition wrapper. It wraps its children in React 19's `<ViewTransition>` and applies named CSS transition classes, so swapping content between renders produces a smooth animation. Use it directly to specify any transition class names, or reach for a preset variant — [`<FadeTransition>`](/ui/FadeTransition), [`<CollapseTransition>`](/ui/CollapseTransition), [`<VerticalTransition>`](/ui/VerticalTransition), [`<HorizontalTransition>`](/ui/HorizontalTransition).

**Things to know:**

- Set `default` for the base transition; `forward` and `back` default to it and let you pick a direction-aware variant. The class names must correspond to `::view-transition-old(.className)` / `::view-transition-new(.className)` rules in your CSS.
- Pass `overlay` to raise the transition group above surrounding content during the animation (`z-index: 100`, from `Transition.css`).
- Direction is driven by the active view-transition type. Call `setTransitionType("forward")` (or `"back"`) inside a `startTransition()` callback before navigating; the variants read that type to choose the correct slide.

## Usage

### Custom transition

```tsx
import { Transition } from "shelving/ui";

<Transition default="zoom" forward="zoomIn" back="zoomOut">
  {children}
</Transition>
```

### Overlay

```tsx
import { Transition } from "shelving/ui";

<Transition default="fade" overlay>
  <Notification/>
</Transition>
```

### Setting the direction with [`setTransitionType()`](/ui/setTransitionType)

```tsx
import { HorizontalTransition, setTransitionType, requireNavigation } from "shelving/ui";
import { startTransition } from "react";

function go(direction: "forward" | "back", url: string) {
  const nav = requireNavigation();
  startTransition(() => {
    setTransitionType(direction);
    nav.forward(url);
  });
}

// In the layout — slides right on forward, left on back:
<HorizontalTransition>
  <Router routes={ROUTES}/>
</HorizontalTransition>
```

## Styling

Transitions are driven by CSS `::view-transition-*` pseudo-element rules keyed on the transition class names, not by per-component `--variable` hooks. `<Transition>` itself only ships the `overlay` rule:

| Variable | Styles | Default |
|---|---|---|
| _(none)_ | `<Transition>` exposes no own custom properties | — |

The `overlay` variant sets `z-index: 100` on `::view-transition-group(.overlay)`. The preset variants document their own timing/distance hooks (`--fade-transition-duration`, `--vertical-transition-size` / `-duration`, `--horizontal-transition-size` / `-duration`) on their pages.

**Global tokens it reads** — none directly; the preset variants fall back to [`--duration-fast`](/ui/getDurationClass) / [`--duration-normal`](/ui/getDurationClass).
