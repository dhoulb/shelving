# Card

A boxed surface that groups a self-contained piece of content. Rendered as an `<article>`, painted from the tint ladder (surface, text) and styled with rounded corners and padding by default.

**Things to know:**

- Set `href` or `onClick` to make the whole card navigable — a stretched, visually-hidden overlay `<a>` / `<button>` covers the card while the children render normally inside. Real interactive elements inside the card (inline links, buttons) stay clickable and keyboard-focusable.
- `color=` and `status=` move the tint anchor for the card's scope, so the surface, text, and hover shade all re-derive together — and nested components (`<Tag>`, `<Preformatted>`, `<Button>`) inherit the same tint.
- A card styles only the box. Lay out its contents with the usual block components (`<Subheading>`, `<Paragraph>`, `<Row>`, …).
- Cards have no drop shadow by default — set `shadow="small"`, `shadow="normal"` or `shadow="large"` to raise a given card.
- Composes the standard styling variants: `color`, `status`, `padding`, `space`, `width`, `shadow`, plus typography.

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

### Shadow

```tsx
import { Card, Subheading } from "shelving/ui";

// Raise a card a little or a lot.
<Card shadow="small"><Subheading>Raised</Subheading></Card>
<Card shadow="large"><Subheading>Raised more</Subheading></Card>
```

## Styling

`Card` paints from the [tint ladder](/ui/TINT_CLASS); override these hooks at `:root` (or any ancestor scope) to retheme. Apply `color=` / `status=` (on the card or an ancestor scope) to recolour everything at once — surface, text, and hover shade re-derive together; reach for a per-property hook for a single surgical change.

| Variable | Styles | Default |
|---|---|---|
| `--card-background` | Surface fill | `var(--tint-90)` |
| `--card-hover-background` | Surface fill when a navigable card is hovered | `var(--tint-95)` |
| `--card-color` | Text colour | `var(--tint-00)` |
| `--card-border` | Border shorthand | `var(--card-stroke) solid var(--tint-80)` |
| `--card-stroke` | Border thickness — set it (e.g. `var(--stroke-normal)`) to show the border | `0` |
| `--card-radius` | Corner radius | `var(--radius-normal)` (16px) |
| `--card-padding` | Inner top and bottom padding (one length) | `var(--space-normal)` (16px) |
| `--card-indent` | Inner left and right padding (one length) | `var(--space-normal)` (16px) |
| `--card-space` | Outer block margin (top + bottom) | `var(--space-paragraph)` (16px) |
| `--card-shadow` | Drop shadow | `none` |
| `--card-transition` | Transition | `all var(--duration-fast)` (150ms) |
| `--card-focus-border` | Focus outline | `var(--stroke-focus) solid var(--color-focus)` |

**Global tokens it reads** — move these to retheme broadly rather than overriding ladder steps directly: the tint ladder `--tint-00` / `--tint-80` / `--tint-90` / `--tint-95`, plus `--space-normal`, `--space-paragraph`, `--radius-normal`, `--stroke-focus`, `--color-focus`, and `--duration-fast`.

```css
/* Theme: raised cards with tighter corners. */
:root {
  --card-shadow: var(--shadow-normal);
  --card-radius: var(--radius-small);
}
```

The `--card-shadow` hook sets the app-wide default; the `shadow=` variant prop wins over it on a per-card basis.

To recolour cards, apply `color=` / `status=` to the card (or a tinted ancestor scope) — e.g. `<Card color="purple">` — rather than a per-component tint hook.
