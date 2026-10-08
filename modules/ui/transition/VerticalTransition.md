# VerticalTransition

A direction-aware `<Transition>` preset that slides its children vertically — down when moving forward, up when moving back. It reads the active transition type so the slide direction matches the navigation direction.

**Things to know:**

- Slides down by default and when the type is `"forward"`; slides up when the type is `"back"`.
- Inside `<Navigation>` the direction is automatic: a link click, `NavigationStore.forward()` or `NavigationStore.redirect()` sets the `"forward"` type, and the browser back or forward button sets `"back"`. Outside `<Navigation>`, set the direction with `setTransitionType("forward" | "back")` inside a `startTransition()` callback — see `<Transition>`.
- Pass `overlay` to raise the transition group above surrounding content during the animation (`z-index: 100`).
- The old and new content slide a full height apart, so they sit edge to edge and never overlap.
- The slide is clipped to the element's own box (`overflow: clip` on the group), so it does not paint over the content around it.
- During the slide, the snapshots paint above fixed elements such as a bottom bar. To keep a fixed element on top, give it its own `view-transition-name` and put the slide groups below it:

  ```css
  ::view-transition-group(.slide-up),
  ::view-transition-group(.slide-down) {
    z-index: -1;
  }
  ```

- Under `prefers-reduced-motion: reduce` the slide distance is forced to `0`, so the transition degrades to an opacity-only crossfade with no positional movement (large viewport-level slides are exactly what the preference exists to suppress).

## Usage

```tsx
import { VerticalTransition } from "shelving/ui";

<VerticalTransition>
  <Router routes={ROUTES}/>
</VerticalTransition>
```

## Styling

| Variable | Styles | Default |
|---|---|---|
| `--vertical-transition-size` | Slide distance for the enter/leave keyframes. A percentage is of the element's own height. | `100%` |
| `--vertical-transition-duration` | Duration of the slide keyframes | `var(--duration-normal)` |

**Global tokens it reads** — `--duration-normal`.
