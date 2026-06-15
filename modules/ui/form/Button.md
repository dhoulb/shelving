# Button

A clickable styled as a solid button. Renders an `<a href="">` when given `href`, or a `<button>` when given `onClick` — the shared `Clickable` primitive picks the element, so a button is always the right semantics for what it does.

**Things to know:**

- Content-width by default: it sizes to its label and never grows. Pass `full` to fill the available width (it then shrinks to share a row, down to the content floor).
- `strong` marks the default action in a form — a filled background instead of an outline. `plain` and `outline` drop the background until hover/focus.
- `color=` / `status=` move the tint anchor, so the background, border and label re-derive from the same ladder; `small` tightens the padding.
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

### Reusing the button class

```tsx
import { getButtonClass } from "shelving/ui";

// Style an arbitrary element as a button.
<label className={getButtonClass({ color: "primary", small: true })}>
  Upload<input type="file" hidden />
</label>
```

## Styling

`Button` paints from the [tint ladder](/ui/TINT_CLASS). Override these hooks at `:root` or any ancestor scope; move `--button-tint` to recolour the whole button, or use a per-property hook for one change.

| Variable | Styles | Default |
|---|---|---|
| `--button-tint` | Tint anchor for the button scope | `inherit` (flows from `color=` / `status=` / parent) |
| `--button-background` | Surface fill | `var(--tint-90)` |
| `--button-hover-background` | Surface fill on hover / focus | `var(--tint-95)` |
| `--button-text` | Label colour | `var(--tint-50)` |
| `--button-border` | Border shorthand | `var(--button-stroke) solid var(--tint-80)` |
| `--button-stroke` | Border / outline thickness | `var(--stroke-normal)` (2px) |
| `--button-radius` | Corner radius | `var(--radius-xsmall)` (8px) |
| `--button-padding` | Inner padding | `var(--space-small)` (12px) |
| `--button-small-padding` | Inner padding when `small` | `var(--space-xxsmall)` (4px) |
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
| `--button-strong-border` | Border when `strong` | `var(--button-stroke) solid transparent` |
| `--button-strong-hover-background` | Hover fill when `strong` | `var(--tint-55)` |

**Global tokens it reads:** the tint ladder [`--tint-50`](/ui/TINT_CLASS) / [`--tint-80`](/ui/TINT_CLASS) / [`--tint-90`](/ui/TINT_CLASS) / [`--tint-95`](/ui/TINT_CLASS) / [`--tint-100`](/ui/TINT_CLASS) / [`--tint-55`](/ui/TINT_CLASS), plus [`--space-small`](/ui/getSpaceClass), [`--space-xxsmall`](/ui/getSpaceClass), [`--radius-xsmall`](/ui/getRadiusClass), [`--stroke-normal`](/ui/getStrokeClass), [`--stroke-focus`](/ui/getStrokeClass), [`--color-focus`](/ui/getColorClass), [`--font-body`](/ui/getFontClass), [`--weight-strong`](/ui/getWeightClass), [`--size-normal`](/ui/getSizeClass), [`--leading`](/ui/getSizeClass), and [`--duration-fast`](/ui/getDurationClass).

```css
/* Theme: pill-shaped buttons. */
:root {
  --button-radius: 999px;
}
```

## See also

- [`Clickable`](/ui/Clickable) — the unstyled click/press primitive `Button` delegates to.
- [`Link`](/ui/Link) — an inline text link (vs. a button-styled `<a>`).
- [`ui`](/ui) — the styling system: tint ladder, cascade layers, and theming.
