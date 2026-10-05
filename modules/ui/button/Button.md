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

`--button-padding` and `--button-small-padding` set the `padding` shorthand, so a single value pads both axes equally and a two-value override pads block and inline separately (e.g. `var(--space-small) var(--space-normal)`).

The `--button-*` colour hooks without a look in their name paint the default look. `solid` has its own `--button-solid-*` colour hooks.

`--button-shadow`, `--button-hover-transform` and the `--button-active-*` pressed-state hooks are static and apply to every button, with one exception: `plain` and `outline` never paint a box shadow in any state — it has no fill until hover, so a raised edge under it reads broken. The hover and pressed transforms still apply to it, so all buttons move together. `--button-transition` already covers animating the press and release.

`plain`, `outline` and `selected={false}` share the `--button-plain-*` hooks: `--button-plain-text` recolours the label, `--button-plain-hover-background` / `--button-plain-hover-border` paint the hover and focus state, and the `--button-plain-active-*` pair paints the pressed state. The hover fill falls back to `--button-hover-background`, so plain and outline buttons always hover like a default button. `--button-plain-border` sets the resting border of `plain` (transparent by default), and `--button-outline-border` sets the resting border of `outline`.

Backgrounds paint to the button's true edge: `background-origin` is set to `border-box`, so a gradient or image background in any state reaches through the transparent border instead of stopping 2px short at the padding box.

| Variable | Styles | Default |
|---|---|---|
| `--button-background` | Surface fill | `var(--tint-80)` |
| `--button-hover-background` | Surface fill on hover / focus | `var(--tint-75)` |
| `--button-hover-border` | Border on hover / focus | `var(--button-stroke) solid transparent` |
| `--button-hover-transform` | Transform on hover / focus | `none` |
| `--button-text` | Label colour | `var(--tint-50)` |
| `--button-border` | Border shorthand | `var(--button-stroke) solid transparent` |
| `--button-stroke` | Border / outline thickness | `var(--stroke-normal)` (2px) |
| `--button-radius` | Corner radius | `var(--radius-xsmall)` (8px) |
| `--button-padding` | Inner padding | `var(--space-small)` (12px) |
| `--button-small-padding` | Inner padding when `small` | `var(--space-xxsmall)` (4px) |
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
| `--button-outline-border` | Resting border when `outline` | `var(--button-stroke) solid var(--tint-50)` |
| `--button-unselected-background` | Resting fill when `selected={false}` | `transparent` |
| `--button-plain-hover-background` | Fill on hover / focus when `plain` or `outline` | `var(--button-hover-background)` |
| `--button-plain-hover-border` | Border on hover / focus when `plain` or `outline` | `var(--button-hover-border)` (transparent) |
| `--button-plain-active-background` | Fill while pressed when `plain` or `outline` | `var(--button-plain-hover-background)` |
| `--button-plain-active-border` | Border while pressed when `plain` or `outline` | `var(--button-plain-hover-border)` |

**Global tokens it reads:** the tint ladder `--tint-50` / `--tint-55` / `--tint-75` / `--tint-80` / `--tint-100`, plus `--space-small`, `--space-xxsmall`, `--radius-xsmall`, `--stroke-normal`, `--stroke-focus`, `--color-focus`, `--font-body`, `--weight-normal`, `--size-normal`, `--leading`, and `--duration-fast`.

```css
/* Theme: pill-shaped buttons, with roomier inline padding. */
:root {
  --button-radius: 999px;
  --button-padding: var(--space-small) var(--space-normal);
}
```

```css
/* Theme: outline buttons use a softer edge than the label colour. */
:root {
  --button-outline-border: var(--stroke-normal) solid var(--tint-80);
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
