# Button

A clickable styled as a solid button. Renders an `<a href="">` when given `href`, or a `<button>` when given `onClick` — the shared `<Clickable>` primitive picks the element, so a button is always the right semantics for what it does.

**Things to know:**

- Content-width by default: it sizes to its label and never grows. Pass `full` to fill the available width (it then shrinks to share a row, down to the content floor).
- `strong` marks the default action in a form — a filled background instead of an outline. `plain` and `outline` drop the background until hover/focus.
- `color=` / `status=` move the tint anchor, so the background, border and label re-derive from the same ladder; `small` tightens the padding.
- `springy` gives the button physical press feedback: it squashes on activation, rebounds past its resting size, and settles. Under `prefers-reduced-motion: reduce` it collapses to a flat opacity change, so the press is still acknowledged without any movement.
- `sparkle` sweeps a band of light across the button on a loop — a "look at me" treatment for a single call to action, not something to put on every button in a row. Under `prefers-reduced-motion: reduce` the band stops travelling and sits still as a static sheen. A disabled button never shimmers.
- Neither animation needs JavaScript, and `getButtonClass(variants)` picks both up, so a composed usage animates the same way.
- The button paints no shadow by default, and pressing it moves nothing. Set `--button-shadow` / `--button-active-shadow` / `--button-active-transform` to give it a 3D pressable edge that compresses on press (see Styling) — that's independent of `springy`, and the two combine.
- `getButtonClass(variants)` returns the same `className` the component composes — use it to style a non-`<button>` element as a button when `Button` itself doesn't fit.

## Usage

### Actions and links

```tsx
import { Button } from "shelving/ui";

<Button onClick={save} color="primary" strong>Save</Button>
<Button href="/about">About</Button>
<Button onClick={remove} status="error">Delete</Button>
```

### A row of buttons

```tsx
import { Button } from "shelving/ui";
import { Row } from "shelving/ui";

<Row gap="small" right>
  <Button plain onClick={cancel}>Cancel</Button>
  <Button strong onClick={submit}>Continue</Button>
</Row>
```

### A tactile call to action

```tsx
import { Button } from "shelving/ui";

// Shimmers until it's claimed, and squashes when pressed.
<Button onClick={claim} color="primary" strong springy sparkle>
  Claim your badge
</Button>
```

### Reusing the button class

```tsx
import { getButtonClass } from "shelving/ui";

// Style an arbitrary element as a button.
<label className={getButtonClass({ color: "primary", small: true })}>
  Upload<input type="file" hidden />
</label>
```

## Styling

`Button` paints from the [tint ladder](/ui/TINT_CLASS). Override these hooks at `:root` or any ancestor scope; apply `color=` / `status=` (on the button or an ancestor scope) to recolour the whole button, or use a per-property hook for one change.

| Variable | Styles | Default |
|---|---|---|
| `--button-background` | Surface fill | `var(--tint-90)` |
| `--button-hover-background` | Surface fill on hover / focus | `var(--tint-95)` |
| `--button-hover-border` | Border on hover / focus | `var(--button-stroke) solid var(--tint-90)` |
| `--button-text` | Label colour | `var(--tint-50)` |
| `--button-border` | Border shorthand | `var(--button-stroke) solid var(--tint-80)` |
| `--button-stroke` | Border / outline thickness | `var(--stroke-normal)` (2px) |
| `--button-radius` | Corner radius | `var(--radius-xsmall)` (8px) |
| `--button-padding` | Inner padding | `var(--space-small)` (12px) |
| `--button-small-padding` | Inner padding when `small` | `var(--space-xxsmall)` (4px) |
| `--button-gap` | Gap between icon and label | `var(--space-small)` (12px) |
| `--button-small-gap` | Gap between icon and label when `small` | `var(--space-xxsmall)` (4px) |
| `--button-space` | Outer block margin | `var(--space-small)` (12px) |
| `--button-font` | Font family | `var(--font-body)` |
| `--button-weight` | Font weight | `var(--weight-strong)` (700) |
| `--button-size` | Font size | `var(--size-normal)` |
| `--button-leading` | Line height | `var(--leading)` |
| `--button-transition` | Transition | `all var(--duration-fast)` (150ms) |
| `--button-focus-border` | Focus outline | `var(--stroke-focus) solid var(--color-focus)` |
| `--button-disabled-opacity` | Opacity when disabled | `0.5` |
| `--button-strong-background` | Fill when `strong` | `var(--tint-50)` |
| `--button-strong-text` | Label colour when `strong` | `var(--tint-100)` |
| `--button-strong-hover-background` | Hover fill when `strong` | `var(--tint-55)` |
| `--button-shadow` | Shadow at rest | `none` |
| `--button-active-shadow` | Shadow while pressed | `var(--button-shadow)` |
| `--button-active-transform` | Transform while pressed | `none` |
| `--button-press-scale` | Squash scale at the start of the `springy` press | `0.9` |
| `--button-press-overshoot` | Rebound scale before the `springy` press settles | `1.05` |
| `--button-press-duration` | Length of the `springy` press animation | `var(--duration-normal)` (300ms) |
| `--button-press-easing` | Easing of the `springy` press animation | `ease-out` |
| `--button-press-opacity` | Opacity while pressed when `springy` and motion is reduced | `0.8` |
| `--button-sparkle-color` | Colour of the `sparkle` shimmer band | `var(--tint-100)` (white) |
| `--button-sparkle-opacity` | Intensity of the `sparkle` shimmer band | `0.6` |
| `--button-sparkle-duration` | Period of one `sparkle` sweep-and-pause cycle | `2.5s` |
| `--button-sparkle-angle` | Angle of the `sparkle` shimmer band | `100deg` |

**Global tokens it reads:** the tint ladder `--tint-50` / `--tint-80` / `--tint-90` / `--tint-95` / `--tint-100` / `--tint-55`, plus `--space-small`, `--space-xxsmall`, `--radius-xsmall`, `--stroke-normal`, `--stroke-focus`, `--color-focus`, `--font-body`, `--weight-strong`, `--size-normal`, `--leading`, `--duration-fast`, and `--duration-normal`.

```css
/* Theme: pill-shaped buttons. */
:root {
  --button-radius: 999px;
}
```

```css
/* Theme: a 3D pressable edge that compresses when the button is pushed. */
:root {
  --button-shadow: 0 0.25rem 0 var(--tint-40);
  --button-active-shadow: 0 0.05rem 0 var(--tint-40);
  --button-active-transform: translateY(0.2rem);
}
```

The press hooks are plain CSS state, not an animation, so they apply to every button whether or not it's `springy` — the two layer up: the shadow compresses as the scale keyframe squashes. `springy` animates the `scale` property rather than `transform`, precisely so it doesn't clobber `--button-active-transform`.
