# Card

A boxed surface that groups a self-contained piece of content. Rendered as an `<article>`, painted from the tint ladder (surface, border, text) and styled with rounded corners and padding by default.

**Things to know:**

- Set `href` or `onClick` to make the whole card navigable — a stretched, visually-hidden overlay `<a>` / `<button>` covers the card while the children render normally inside. Real interactive elements inside the card (inline links, buttons) stay clickable and keyboard-focusable.
- `color=` and `status=` move the tint anchor for the card's scope, so the surface, border, text, and hover shade all re-derive together — and nested components ([`<Tag>`](/ui/Tag), [`<Preformatted>`](/ui/Preformatted), [`<Button>`](/ui/Button)) inherit the same tint.
- A card styles only the box. Lay out its contents with the usual block components ([`<Subheading>`](/ui/Subheading), [`<Paragraph>`](/ui/Paragraph), [`<Row>`](/ui/Row), …).
- Composes the standard styling variants: `color`, `status`, `padding`, `space`, `width`, plus typography.

## Usage

### Static card

```tsx
import { Card, Subheading, Paragraph } from "shelving/ui";

<Card>
  <Subheading>Storage</Subheading>
  <Paragraph>1.2 GB of 5 GB used.</Paragraph>
</Card>
```

### Navigable card

```tsx
import { Card, Subheading, Paragraph } from "shelving/ui";

// The entire card is a link; `title` labels the overlay for screen readers.
<Card href="/projects/shelving" title="Open Shelving">
  <Subheading>Shelving</Subheading>
  <Paragraph>TypeScript data toolkit.</Paragraph>
</Card>
```

### Status and colour

```tsx
import { Card, Subheading } from "shelving/ui";

<Card status="error"><Subheading>Couldn't load</Subheading></Card>
<Card color="purple" padding="large" space="none"><Subheading>Featured</Subheading></Card>
```

## Styling

`Card` paints from the [tint ladder](/ui/TINT_CLASS); override these hooks at `:root` (or any ancestor scope) to retheme. Move `--card-tint` to recolour everything at once; reach for a per-property hook for a single surgical change.

| Variable | Styles | Default |
|---|---|---|
| `--card-tint` | Tint anchor for the card scope — recolours surface, border, text and hover together | `inherit` (flows from `color=` / `status=` / parent) |
| `--card-background` | Surface fill | `var(--tint-90)` |
| `--card-hover-background` | Surface fill when a navigable card is hovered | `var(--tint-95)` |
| `--card-color` | Text colour | `var(--tint-00)` |
| `--card-border` | Border shorthand | `var(--card-stroke) solid var(--tint-80)` |
| `--card-stroke` | Border / outline thickness | `var(--stroke-normal)` (2px) |
| `--card-radius` | Corner radius | `var(--radius-normal)` (16px) |
| `--card-padding` | Inner padding | `var(--space-normal)` (16px) |
| `--card-space` | Outer block margin (top + bottom) | `var(--space-paragraph)` (16px) |
| `--card-shadow` | Drop shadow | `none` |
| `--card-transition` | Transition | `all var(--duration-fast)` (150ms) |
| `--card-focus-border` | Focus outline | `var(--stroke-focus) solid var(--color-focus)` |

**Global tokens it reads** — move these to retheme broadly rather than overriding ladder steps directly: the tint ladder [`--tint-00`](/ui/TINT_CLASS) / [`--tint-80`](/ui/TINT_CLASS) / [`--tint-90`](/ui/TINT_CLASS) / [`--tint-95`](/ui/TINT_CLASS), plus [`--space-normal`](/ui/getSpaceClass), [`--space-paragraph`](/ui/getSpaceClass), [`--radius-normal`](/ui/getRadiusClass), [`--stroke-normal`](/ui/getStrokeClass), [`--stroke-focus`](/ui/getStrokeClass), [`--color-focus`](/ui/getColorClass), and [`--duration-fast`](/ui/getDurationClass).

```css
/* Theme: borderless cards with a soft shadow and tighter corners. */
:root {
  --card-border: none;
  --card-shadow: var(--shadow-small);
  --card-radius: var(--radius-small);
}

/* Retint every card purple — surface, border, text and hover all follow. */
:root {
  --card-tint: var(--color-purple);
}
```

## See also

- [`Panel`](/ui/Panel) — a card-like grouping for stacked sections rather than standalone content.
- [`Section`](/ui/Section) — a titled block; cards often hold one or more sections.
- [`shelving/ui`](/ui) — the styling system: tint ladder, cascade layers, and theming.
