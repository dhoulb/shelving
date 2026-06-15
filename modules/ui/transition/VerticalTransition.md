# VerticalTransition

A direction-aware [`Transition`](/ui/Transition) preset that slides its children vertically — down when moving forward, up when moving back. It reads the active transition type so the slide direction matches the navigation direction.

**Things to know:**

- Defaults to `slideDown`; with the type set to `"forward"` it slides down (`slideDown`), and to `"back"` it slides up (`slideUp`).
- Set the direction with `setTransitionType("forward" | "back")` inside a `startTransition()` callback before navigating — see [`Transition`](/ui/Transition).
- Pass `overlay` to raise the transition group above surrounding content during the animation (`z-index: 100`).

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
| `--vertical-transition-size` | Slide distance for the enter/leave keyframes | `25vh` |
| `--vertical-transition-duration` | Duration of the slide keyframes | `var(--duration-normal)` |

**Global tokens it reads** — `--duration-normal`.

## See also

- [`HorizontalTransition`](/ui/HorizontalTransition) — the horizontal counterpart
- [`Transition`](/ui/Transition) — the base wrapper, `overlay`, and `setTransitionType`
- [`Navigation`](/ui/Navigation) — triggers the route changes this animates
