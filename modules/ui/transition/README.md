# Transition

React 19 View Transition wrappers for animated enter and leave effects. Each component wraps its children in React's `<ViewTransition>` and applies a named CSS transition class, so swapping content between renders produces a smooth animation.

## Components

| Component | Default transition | Forward / back |
|---|---|---|
| `<FadeTransition>` | `fade` | — |
| `<CollapseTransition>` | `collapse` | — |
| `<VerticalTransition>` | `slideDown` | forward: `slideDown`, back: `slideUp` |
| `<HorizontalTransition>` | `slideRight` | forward: `slideRight`, back: `slideLeft` |
| `<Transition>` | configurable | configurable |

`<VerticalTransition>` and `<HorizontalTransition>` are direction-aware: they read the transition type set by `setTransitionType()` and choose the correct slide direction.

## Basic usage

Wrap any content that should animate when it mounts or unmounts:

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

## Direction-aware routing transitions

Set the transition type before a navigation, then wrap routed content in the appropriate transition:

```tsx
import { HorizontalTransition, setTransitionType } from "shelving/ui";

function navigate(direction: "forward" | "back") {
  startTransition(() => {
    setTransitionType(direction);
    nav.forward(nextUrl);
  });
}

// In the layout:
<HorizontalTransition>
  <Router routes={ROUTES}/>
</HorizontalTransition>
```

When `direction` is `"forward"` the content slides right; when `"back"` it slides left.

## Overlay variant

Add `overlay` to raise the transition group above surrounding content during animation (`z-index: 100`):

```tsx
<FadeTransition overlay>
  <Notification/>
</FadeTransition>
```

## Custom transitions

Use `<Transition>` directly to specify any transition class names:

```tsx
<Transition default="zoom" forward="zoomIn" back="zoomOut">
  {children}
</Transition>
```

Class names must correspond to `::view-transition-class()` rules in your CSS.

## See also

- [`router`](/ui/router) — `<Navigation>` triggers route changes that transitions animate
- [`dialog`](/ui/dialog) — animate dialog enter and leave
