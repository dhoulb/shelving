# HorizontalTransition

A direction-aware [`<Transition>`](/ui/Transition) preset that slides its children horizontally — right when moving forward, left when moving back. It reads the active transition type so the slide direction matches the navigation direction.

**Things to know:**

- Defaults to `slideRight`; with the type set to `"forward"` it slides right (`slideRight`), and to `"back"` it slides left (`slideLeft`).
- Set the direction with `setTransitionType("forward" | "back")` inside a `startTransition()` callback before navigating — see [`<Transition>`](/ui/Transition).
- Pass `overlay` to raise the transition group above surrounding content during the animation (`z-index: 100`).

## Usage

```tsx
import { HorizontalTransition, setTransitionType, requireNavigation } from "shelving/ui";
import { startTransition } from "react";

function navigate(direction: "forward" | "back", url: string) {
  const nav = requireNavigation();
  startTransition(() => {
    setTransitionType(direction);
    nav.forward(url);
  });
}

// In the layout:
<HorizontalTransition>
  <Router routes={ROUTES}/>
</HorizontalTransition>
```

## Styling

| Variable | Styles | Default |
|---|---|---|
| `--horizontal-transition-size` | Slide distance for the enter/leave keyframes | `25vw` |
| `--horizontal-transition-duration` | Duration of the slide keyframes | `var(--duration-normal)` |

**Global tokens it reads** — [`--duration-normal`](/ui/getDurationClass).
