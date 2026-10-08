# Transition

The base View Transition wrapper. It wraps its children in React 19's `<ViewTransition>` and applies named CSS transition classes, so swapping content between renders produces a smooth animation. Use it directly to specify any transition class names, or reach for a preset variant — `<FadeTransition>`, `<CollapseTransition>`, `<VerticalTransition>`, `<HorizontalTransition>`.

**Things to know:**

- Set `default` for the base transition; `forward` and `back` default to it and let you pick a direction-aware variant. The class names must correspond to `::view-transition-old(.className)` / `::view-transition-new(.className)` rules in your CSS.
- Pass `overlay` to raise the transition group above surrounding content during the animation (`z-index: 100`, from `Transition.css`).
- Direction is driven by the active view-transition type. `<Navigation>` sets it for each page change (`"forward"` for a link or `NavigationStore.forward()`, `"back"` for the browser back button). For any other change, call `setTransitionType("forward")` (or `"back"`) inside a `startTransition()` callback; the variants read that type to choose the correct slide.
- React runs a view transition only for a transition update (`startTransition()`, `useDeferredValue()` or a Suspense reveal). A sync update, for example a `useStore()` change, swaps the content with no animation.
- The preset variants honour `prefers-reduced-motion: reduce` — positional movement (slides, collapse) is removed while opacity-only fades are kept (see each preset's page). Custom transition classes should ship their own `@media (prefers-reduced-motion: reduce)` override; `animation: none` on the `::view-transition-*` pseudo-elements makes the swap an instant cut while the DOM update still happens.

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
import { FadeTransition } from "shelving/ui";

<FadeTransition overlay>
  <Notification/>
</FadeTransition>
```

### Page transitions

`<Navigation>` publishes each page change as a transition with a direction type:

```tsx
import { HorizontalTransition, Navigation, Router } from "shelving/ui";

// Slides right on forward, left on back:
<Navigation>
  <HorizontalTransition>
    <Router routes={ROUTES}/>
  </HorizontalTransition>
</Navigation>
```

### Setting the direction with `setTransitionType()`

```tsx
import { HorizontalTransition, setTransitionType } from "shelving/ui";
import { startTransition, useState } from "react";

function Steps() {
  const [step, setStep] = useState(0);
  const go = (direction: "forward" | "back") =>
    startTransition(() => {
      setTransitionType(direction);
      setStep(s => s + (direction === "forward" ? 1 : -1));
    });
  return (
    <HorizontalTransition>
      <Step key={step} step={step} onNext={() => go("forward")} onBack={() => go("back")}/>
    </HorizontalTransition>
  );
}
```

## Styling

Transitions are driven by CSS `::view-transition-*` pseudo-element rules keyed on the transition class names, not by per-component `--variable` hooks. `<Transition>` itself only ships the `overlay` rule:

| Variable | Styles | Default |
|---|---|---|
| _(none)_ | `<Transition>` exposes no own custom properties | — |

The `overlay` variant sets `z-index: 100` on `::view-transition-group(.overlay)`. The preset variants document their own timing/distance hooks (`--fade-transition-duration`, `--vertical-transition-size` / `-duration`, `--horizontal-transition-size` / `-duration`) on their pages.

**Global tokens it reads** — none directly; the preset variants fall back to `--duration-fast` / `--duration-normal`.
