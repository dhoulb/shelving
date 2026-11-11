# HorizontalTransition

A direction-aware `<Transition>` preset that slides its children horizontally — right when moving forward, left when moving back. It reads the active transition type so the slide direction matches the navigation direction.

**Things to know:**

- Slides right by default and when the type is `"forward"`; slides left when the type is `"back"`.
- Inside `<Navigation>` the direction is automatic: a link click, `NavigationStore.forward()` or `NavigationStore.redirect()` sets the `"forward"` type, and the browser back or forward button sets `"back"`. Outside `<Navigation>`, set the direction with `setTransitionType("forward" | "back")` inside a `startTransition()` callback — see `<Transition>`.
- Pass `overlay` to raise the transition group above surrounding content during the animation (`z-index: 100`).
- The old and new content slide a full width apart, so they sit edge to edge and never overlap.
- The slide is clipped to the element's own box (`overflow: clip` on the group), so it does not paint over the content around it.
- During the slide, the snapshots paint above fixed elements such as a bottom bar. To keep a fixed element on top, give it its own `view-transition-name` and raise its group:

  ```css
  .bottom-bar {
    view-transition-name: bottom-bar;
  }

  ::view-transition-group(bottom-bar) {
    z-index: 1;
  }
  ```

- Under `prefers-reduced-motion: reduce` the slide distance is forced to `0`, so the transition degrades to an opacity-only crossfade with no positional movement (large viewport-level slides are exactly what the preference exists to suppress).

## Usage

```tsx
import { HorizontalTransition, Navigation, Router } from "shelving/ui";

// Links slide right, the browser back button slides left.
<Navigation>
  <HorizontalTransition>
    <Router routes={ROUTES}/>
  </HorizontalTransition>
</Navigation>
```

## Use the class without the component

The CSS is a CSS module, so its class names are hashed. To use the same animation on your own `<ViewTransition>`, import `SLIDE_RIGHT_TRANSITION_CLASS` and `SLIDE_LEFT_TRANSITION_CLASS`. Each one also holds a plain global class name, so your CSS can still target it.

```tsx
import { ViewTransition } from "react";
import { SLIDE_RIGHT_TRANSITION_CLASS } from "shelving/ui";

<ViewTransition enter={SLIDE_RIGHT_TRANSITION_CLASS} exit={SLIDE_RIGHT_TRANSITION_CLASS}>
  <div className="panel">…</div>
</ViewTransition>
```

## Styling

| Variable | Styles | Default |
|---|---|---|
| `--horizontal-transition-size` | Slide distance for the enter/leave keyframes. A percentage is of the element's own width. | `100%` |
| `--horizontal-transition-duration` | Duration of the slide keyframes | `var(--duration-normal)` |

**Global tokens it reads** — `--duration-normal`.
