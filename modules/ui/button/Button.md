# Button

A clickable styled as a button. Renders an `<a href="">` when given `href`, or a `<button>` when given `onClick` — the shared `<Clickable>` primitive picks the element, so a button is always the right semantics for what it does.

**Things to know:**

- Content-width by default: it sizes to its label and never grows. Pass `full` to fill the available width (it then shrinks to share a row, down to the content floor).
- There are four looks:
  - **Default** — a pale fill of the tint colour with the tint colour as text. Use it for most actions.
  - **`solid`** — a strong fill of the tint colour with white text. Use it for the main action on a screen, such as a form's submit button.
  - **`plain`** — no fill or border until hover or focus. Use it for chrome-level actions, such as breadcrumbs and a dialog's close button.
  - **`outline`** — like `plain`, but with a border until hover or focus.
- On hover, `plain` and `outline` take the same fill as a hovered default button.
- `color=` / `status=` move the tint anchor, so they set the colour of every look. A colourless button stays a neutral grey.
- `selected` makes a group of buttons, such as tabs. `selected={true}` sets `aria-pressed` (or `aria-current` on a link) and keeps the button's normal look. `selected={false}` also drops the fill until hover or focus, like `plain`, so the selected button stands out. Leave it `undefined` for a button that is not in a group.
- `small` tightens the padding.
- It takes the block variants, like any block: `space` sets its outer margin (`space="none"` removes it), `padding` and `indent` set its inner padding, and `width` sizes it. A `padding` variant sets the padding but not the minimum height, which `--button-padding` and `--button-height` set.
- `getButtonClass(variants)` returns the same `className` the component composes — use it to style a non-`<button>` element as a button when `Button` itself doesn't fit.
- `className` attaches an app class to one button, merged after the computed classes so an app stylesheet wins — see `ClassProps`.

## Usage

### Actions and links

```tsx
import { Button } from "shelving/ui";

<Button onClick={save} solid color="primary">Save</Button>
<Button href="/about">About</Button>
<Button onClick={remove} status="error">Delete</Button>
<Button onClick={share} outline>Share</Button>
```

### Spacing and size

```tsx
import { Button } from "shelving/ui";

// No outer margin: it sits flush with the content around it.
<Button full space="none" onClick={start}>Start</Button>
```

### A row of buttons

```tsx
import { Button } from "shelving/ui";
import { Row } from "shelving/ui";

<Row gap="small" right>
  <Button plain onClick={cancel}>Cancel</Button>
  <Button solid color="primary" onClick={submit}>Continue</Button>
</Row>
```

### Tabs

```tsx
import { Button, Row } from "shelving/ui";

<Row gap="xsmall">
  {SECTIONS.map(({ key, label }) => (
    <Button key={key} small solid selected={key === section} onClick={() => setSection(key)}>
      {label}
    </Button>
  ))}
</Row>
```

### A one-off treatment

```tsx
import { Button } from "shelving/ui";

// `.spongy-press` lives in the app's own stylesheet — use it for what the theme hooks below can't express.
<Button className="spongy-press" onClick={claim}>Claim</Button>
```

### Reusing the button class

```tsx
import { getButtonClass } from "shelving/ui";

// Style an arbitrary element as a button.
<label className={getButtonClass({ color: "primary", solid: true, small: true })}>
  Upload<input type="file" hidden />
</label>
```

## Styling

`Button` paints from the [tint ladder](/ui/TINT_CLASS). Override these hooks at `:root` or any ancestor scope; apply `color=` / `status=` (on the button or an ancestor scope) to recolour the whole button, or use a per-property hook for one change.

`--button-padding` sets the top and bottom padding, and `--button-indent` the left and right. Each takes one length, not a shorthand.

Every button is at least as tall as a button with an icon, so buttons line up whether they have an icon or not, and at every text size. The minimum height is `--button-icon-size` plus two `--button-padding` plus two `--button-stroke`. It reads those hooks, so it stays correct when a theme changes them. Set `--button-height` to replace it. The `small` variant has its own minimum, `--button-small-height`. Inputs use the same formula (`--input-height`), so an input and a button sit at the same height by default.

The `--button-*` colour hooks without a look in their name paint the default look. `solid` has its own `--button-solid-*` colour hooks.

`--button-shadow`, `--button-hover-transform` and the `--button-active-*` pressed-state hooks are static and apply to every button, with one exception: `plain` and `outline` never paint a box shadow in any state — they have no fill until hover, so a raised edge under them reads broken. The hover and pressed transforms still apply to them, so all buttons move together. `--button-transition` already covers animating the press and release.

`plain`, `outline` and `selected={false}` share the `--button-plain-*` hooks: `--button-plain-text` recolours the label, `--button-plain-hover-background` / `--button-plain-hover-border` paint the hover and focus state, and the `--button-plain-active-*` pair paints the pressed state. The hover fill falls back to `--button-hover-background`, so plain and outline buttons always hover like a default button. `--button-plain-border` sets the resting border of `plain` (transparent by default), and `--button-outline-border` sets the resting border of `outline`.

Backgrounds paint to the button's true edge: `background-origin` is set to `border-box`, so a gradient or image background in any state reaches through the transparent border instead of stopping 2px short at the padding box.

| Variable | Styles | Default |
|---|---|---|
| `--button-background` | Surface fill | `var(--tint-90)` |
| `--button-hover-background` | Surface fill on hover / focus | `var(--tint-85)` |
| `--button-hover-border` | Border on hover / focus | `var(--button-stroke) solid transparent` |
| `--button-hover-transform` | Transform on hover / focus | `none` |
| `--button-text` | Label colour | `var(--tint-50)` |
| `--button-border` | Border shorthand | `var(--button-stroke) solid transparent` |
| `--button-stroke` | Border / outline thickness | `var(--stroke-normal)` (2px) |
| `--button-radius` | Corner radius | `var(--radius-xsmall)` (8px) |
| `--button-padding` | Top and bottom padding (one length) | `var(--space-small)` (12px) |
| `--button-indent` | Left and right padding (one length) | `var(--space-small)` (12px) |
| `--button-small-padding` | Top and bottom padding when `small` (one length) | `var(--space-xxsmall)` (4px) |
| `--button-small-indent` | Left and right padding when `small` (one length) | `var(--space-xxsmall)` (4px) |
| `--button-icon-size` | Icon size, and the base of the minimum height | `var(--size-icon)` (24px) |
| `--button-height` | Minimum height | `--button-icon-size` + 2 × `--button-padding` + 2 × `--button-stroke` (52px) |
| `--button-small-height` | Minimum height when `small` | `--button-icon-size` + 2 × `--button-small-padding` + 2 × `--button-stroke` (36px) |
| `--button-gap` | Gap between icon and label | `var(--space-small)` (12px) |
| `--button-small-gap` | Gap between icon and label when `small` | `var(--space-xxsmall)` (4px) |
| `--button-space` | Outer block margin | `var(--space-small)` (12px) |
| `--button-font` | Font family | `var(--font-body)` |
| `--button-weight` | Font weight | `var(--weight-normal)` (400) |
| `--button-size` | Font size | `var(--size-normal)` |
| `--button-leading` | Line height | `var(--leading)` |
| `--button-shadow` | Box shadow (never on `plain`) | `none` |
| `--button-active-background` | Surface fill while pressed | `var(--button-hover-background)` |
| `--button-active-border` | Border while pressed | `var(--button-hover-border)` |
| `--button-active-shadow` | Box shadow while pressed | `var(--button-shadow)` |
| `--button-active-transform` | Transform while pressed | `var(--button-hover-transform)` |
| `--button-transition` | Transition | `all var(--duration-fast)` (150ms) |
| `--button-focus-border` | Focus outline | `var(--stroke-focus) solid var(--color-focus)` |
| `--button-disabled-opacity` | Opacity when disabled | `0.5` |
| `--button-solid-background` | Surface fill when `solid` | `var(--tint-50)` |
| `--button-solid-text` | Label colour when `solid` | `var(--tint-100)` (white) |
| `--button-solid-hover-background` | Surface fill on hover / focus when `solid` | `var(--tint-55)` |
| `--button-solid-active-background` | Surface fill while pressed when `solid` | `var(--button-solid-hover-background)` |
| `--button-plain-text` | Label colour when `plain` or `outline` | `var(--tint-50)` |
| `--button-plain-border` | Resting border when `plain` | `var(--button-stroke) solid transparent` |
| `--button-outline-border` | Resting border when `outline` | `var(--button-stroke) solid var(--tint-80)` |
| `--button-unselected-background` | Resting fill when `selected={false}` | `transparent` |
| `--button-plain-hover-background` | Fill on hover / focus when `plain` or `outline` | `var(--button-hover-background)` |
| `--button-plain-hover-border` | Border on hover / focus when `plain` or `outline` | `var(--button-hover-border)` (transparent) |
| `--button-plain-active-background` | Fill while pressed when `plain` or `outline` | `var(--button-plain-hover-background)` |
| `--button-plain-active-border` | Border while pressed when `plain` or `outline` | `var(--button-plain-hover-border)` |

**Global tokens it reads:** the tint ladder `--tint-50` / `--tint-55` / `--tint-80` / `--tint-85` / `--tint-90` / `--tint-100`, plus `--size-icon`, `--space-small`, `--space-xxsmall`, `--radius-xsmall`, `--stroke-normal`, `--stroke-focus`, `--color-focus`, `--font-body`, `--weight-normal`, `--size-normal`, `--leading`, and `--duration-fast`.

```css
/* Theme: pill-shaped buttons, with roomier inline padding. */
:root {
  --button-radius: 999px;
  --button-indent: var(--space-normal);
}
```

```css
/* Theme: outline buttons use the label colour for their edge. */
:root {
  --button-outline-border: var(--stroke-normal) solid var(--tint-50);
}
```

```css
/* Theme: buttons are raised and press down flat — `plain` and `outline` press down too but never casts a shadow. */
:root {
  --button-shadow: 0 0.25rem 0 var(--tint-30);
  --button-active-transform: translateY(0.2rem);
  --button-active-shadow: 0 0.05rem 0 var(--tint-30);
  --button-transition: all var(--duration-fast) cubic-bezier(0.34, 1.56, 0.64, 1);
}
```
