# FadeTransition

- Kind: component
- Import: `import { FadeTransition } from "shelving/ui";`

Transition that fades its children in and out by animating their opacity.

A `<Transition>` preset that fades its children in and out by animating opacity. Wrap any content that should animate when it mounts or unmounts.

**Things to know:**

- Uses the `fade` transition class — there is no direction-aware variant, so forward and back animate identically.
- Pass `overlay` to raise the transition group above surrounding content during the animation (`z-index: 100`).
- Under `prefers-reduced-motion: reduce` the fade keeps animating — an opacity-only crossfade moves nothing spatially, so it is reduced-motion-safe — but the transition group's positional morph is disabled so content never slides between layouts.

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

## Use the class without the component

The CSS is a CSS module, so its class names are hashed. To use the same animation on your own `<ViewTransition>`, import `FADE_TRANSITION_CLASS`. Each one also holds a plain global class name, so your CSS can still target it.

```tsx
import { ViewTransition } from "react";
import { FADE_TRANSITION_CLASS } from "shelving/ui";

<ViewTransition enter={FADE_TRANSITION_CLASS} exit={FADE_TRANSITION_CLASS}>
  <div className="panel">…</div>
</ViewTransition>
```

## Styling

| Variable | Styles | Default |
|---|---|---|
| `--fade-transition-duration` | Duration of the fade in, the fade out, and the crossfade when content changes in place (also the group's size and position morph) | `var(--duration-fast)` |

**Global tokens it reads** — `--duration-fast`.


## Signatures

```ts
FadeTransition(props: FadeTransitionProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `FadeTransitionProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |
