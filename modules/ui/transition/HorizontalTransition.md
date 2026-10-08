# HorizontalTransition

A direction-aware `<Transition>` preset that slides its children horizontally — right when moving forward, left when moving back. It reads the active transition type so the slide direction matches the navigation direction.

**Things to know:**

- Slides right by default and when the type is `"forward"`; slides left when the type is `"back"`.
- Set the direction with `setTransitionType("forward" | "back")` inside a `startTransition()` callback before navigating — see `<Transition>`.
- Pass `overlay` to raise the transition group above surrounding content during the animation (`z-index: 100`).
- The old and new content slide a full width apart, so they sit edge to edge and never overlap.
- The slide is clipped to the element's own box (`overflow: clip` on the group), so it does not paint over the content around it.
- During the slide, the snapshots paint above fixed elements such as a bottom bar. To keep a fixed element on top, give it its own `view-transition-name` and put the slide groups below it:

  ```css
  ::view-transition-group(.slide-right),
  ::view-transition-group(.slide-left) {
    z-index: -1;
  }
  ```

- Under `prefers-reduced-motion: reduce` the slide distance is forced to `0`, so the transition degrades to an opacity-only crossfade with no positional movement (large viewport-level slides are exactly what the preference exists to suppress).

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
| `--horizontal-transition-size` | Slide distance for the enter/leave keyframes. A percentage is of the element's own width. | `100%` |
| `--horizontal-transition-duration` | Duration of the slide keyframes | `var(--duration-normal)` |

**Global tokens it reads** — `--duration-normal`.
