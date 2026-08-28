# Button

A clickable styled as a solid button. Renders an `<a href="">` when given `href`, or a `<button>` when given `onClick` — the shared `<Clickable>` primitive picks the element, so a button is always the right semantics for what it does.

**Things to know:**

- Content-width by default: it sizes to its label and never grows. Pass `full` to fill the available width (it then shrinks to share a row, down to the content floor).
- Every button is filled. Emphasis comes from colour: `color=` / `status=` move the tint anchor, so `color="primary"` marks the main action and a colourless button stays a neutral grey.
- `plain` de-emphasises — no fill or border until hover/focus, for chrome-level actions like breadcrumbs and a dialog's close button. Set `--button-plain-border` to give plain buttons a resting edge when they need to hold their shape.
- `small` tightens the padding.
- `getButtonClass(variants)` returns the same `className` the component composes — use it to style a non-`<button>` element as a button when `Button` itself doesn't fit.
- `className` attaches an app class to one button, merged after the computed classes so an app stylesheet wins — see `ClassProps`.

## Usage

### Actions and links

```tsx
import { Button } from "shelving/ui";

<Button onClick={save} color="primary">Save</Button>
<Button href="/about">About</Button>
<Button onClick={remove} status="error">Delete</Button>
```

### A row of buttons

```tsx
import { Button } from "shelving/ui";
import { Row } from "shelving/ui";

<Row gap="small" right>
  <Button plain onClick={cancel}>Cancel</Button>
  <Button color="primary" onClick={submit}>Continue</Button>
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
<label className={getButtonClass({ color: "primary", small: true })}>
  Upload<input type="file" hidden />
</label>
```

## Styling

`Button` paints from the [tint ladder](/ui/TINT_CLASS). Override these hooks at `:root` or any ancestor scope; apply `color=` / `status=` (on the button or an ancestor scope) to recolour the whole button, or use a per-property hook for one change.

`--button-padding` and `--button-small-padding` set the `padding` shorthand, so a single value pads both axes equally and a two-value override pads block and inline separately (e.g. `var(--space-small) var(--space-normal)`).

`--button-shadow`, `--button-hover-transform` and the `--button-active-*` pressed-state hooks are static and apply to every button, with one exception: `plain` never paints a box shadow in any state — it has no fill until hover, so a raised edge under it reads broken. The hover and pressed transforms still apply to it, so all buttons move together. `--button-transition` already covers animating the press and release.

`plain` carries its own hooks for where it differs: `--button-plain-text` recolours the label, `--button-plain-hover-background` / `--button-plain-hover-border` paint the hover and focus state, and `--button-plain-border` sets the resting border — transparent by default, so a theme where plain buttons should keep a visible edge (an "outline" button) sets it once. The hover border falls back through `--button-hover-border`, so a theme that borders every hovered button also borders hovered plain ones.

| Variable | Styles | Default |
|---|---|---|
| `--button-background` | Surface fill | `var(--tint-50)` |
| `--button-hover-background` | Surface fill on hover / focus | `var(--tint-55)` |
| `--button-hover-border` | Border on hover / focus | `var(--button-stroke) solid transparent` |
| `--button-hover-transform` | Transform on hover / focus | `none` |
| `--button-text` | Label colour | `var(--tint-100)` |
| `--button-border` | Border shorthand | `var(--button-stroke) solid transparent` |
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
| `--button-shadow` | Box shadow (never on `plain`) | `none` |
| `--button-active-background` | Surface fill while pressed | `var(--button-hover-background)` |
| `--button-active-border` | Border while pressed | `var(--button-hover-border)` |
| `--button-active-shadow` | Box shadow while pressed | `var(--button-shadow)` |
| `--button-active-transform` | Transform while pressed | `var(--button-hover-transform)` |
| `--button-transition` | Transition | `all var(--duration-fast)` (150ms) |
| `--button-focus-border` | Focus outline | `var(--stroke-focus) solid var(--color-focus)` |
| `--button-disabled-opacity` | Opacity when disabled | `0.5` |
| `--button-plain-text` | Label colour when `plain` | `var(--tint-50)` |
| `--button-plain-border` | Resting border when `plain` | `var(--button-stroke) solid transparent` |
| `--button-plain-hover-background` | Fill on hover / focus when `plain` | `var(--tint-95)` |
| `--button-plain-hover-border` | Border on hover / focus when `plain` | `var(--button-hover-border)` (transparent) |

**Global tokens it reads:** the tint ladder `--tint-50` / `--tint-55` / `--tint-95` / `--tint-100`, plus `--space-small`, `--space-xxsmall`, `--radius-xsmall`, `--stroke-normal`, `--stroke-focus`, `--color-focus`, `--font-body`, `--weight-strong`, `--size-normal`, `--leading`, and `--duration-fast`.

```css
/* Theme: pill-shaped buttons, with roomier inline padding. */
:root {
  --button-radius: 999px;
  --button-padding: var(--space-small) var(--space-normal);
}
```

```css
/* Theme: plain buttons keep an edge, so a quiet button holds its shape next to a filled one. */
:root {
  --button-plain-border: var(--stroke-normal) solid var(--tint-80);
  --button-plain-hover-border: var(--stroke-normal) solid var(--tint-80);
}
```

```css
/* Theme: buttons are raised and press down flat — `plain` presses down too but never casts a shadow. */
:root {
  --button-shadow: 0 0.25rem 0 var(--tint-30);
  --button-active-transform: translateY(0.2rem);
  --button-active-shadow: 0 0.05rem 0 var(--tint-30);
  --button-transition: all var(--duration-fast) cubic-bezier(0.34, 1.56, 0.64, 1);
}
```
