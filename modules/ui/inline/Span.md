# Span

Styled inline text — renders a `<span>` element that carries only the colour and typography variant classes you pass it, with no styling of its own. Reach for it when you need to apply variants to a run of text that has no semantic meaning, the inline counterpart to a styled `<div>`.

**Things to know:**

- It is purely presentational: use `<Strong>` for importance, `<Emphasis>` for stress emphasis, `<Mark>` for highlighting, and `<Small>` for fine print — `Span` is for everything that is _only_ a visual tweak.
- With no props it is an inert wrapper — it renders a bare `<span>` and changes nothing.
- It accepts the full [typography variants](/ui/TypographyVariants) (`size`, `weight`, `font`, `case`, `tint`, `left` / `center` / `right`, `wrap` / `nowrap`) and the [colour variant](/ui/ColorVariants) (`color`).
- `color` sets the [tint ladder](/ui/TINT_CLASS) for the span and its descendants; pair it with `tint` to actually paint the span's own text from a ladder step (e.g. `color="purple" tint="40"`).

## Usage

### Applying typography variants

```tsx
import { Span } from "shelving/ui";

<p>Total <Span weight="strong">$35.00</Span> due today.</p>
<p><Span case="upper" size="xsmall">New</Span></p>
```

### Colouring a run of text

```tsx
import { Span } from "shelving/ui";

<Span color="purple" tint="40">on-brand accent</Span>
```

## Styling

`Span` declares no CSS of its own — there are no theming hooks. All appearance comes from the colour and typography variant props, which apply shared variant classes from the design system.
