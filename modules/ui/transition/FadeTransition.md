# FadeTransition

A [`Transition`](/ui/Transition) preset that fades its children in and out by animating opacity. Wrap any content that should animate when it mounts or unmounts.

**Things to know:**

- Uses the `fade` transition class — there is no direction-aware variant, so forward and back animate identically.
- Pass `overlay` to raise the transition group above surrounding content during the animation (`z-index: 100`).

## Usage

```tsx
import { FadeTransition } from "shelving/ui";

function Panel({ visible }: { visible: boolean }) {
  return visible ? (
    <FadeTransition>
      <div className="panel">…</div>
    </FadeTransition>
  ) : null;
}
```

## Styling

| Variable | Styles | Default |
|---|---|---|
| `--fade-transition-duration` | Duration of the fade-in and fade-out keyframes | `var(--duration-fast)` |

**Global tokens it reads** — [`--duration-fast`](/ui/getDurationClass).
