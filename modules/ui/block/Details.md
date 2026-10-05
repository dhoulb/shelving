# Details

A collapsible panel. The title is always visible. The content shows when the user opens the panel. Built on the native `<details>` and `<summary>` elements, so it works with the keyboard and without JavaScript.

**Things to know:**

- A chevron on the right of the title points down when the panel is closed and up when it is open.
- The panel animates to its true height where the browser supports `interpolate-size` and `::details-content`. Other browsers open it at once.
- Give sibling panels the same `name` to make them open exclusively: when one opens, the others close.
- Two or more panels next to each other get a divider line between them.
- A raw `<details>` inside `.prose` gets the same spacing and divider, but it keeps the browser's own marker in place of the chevron.

## Usage

### Single panel

```tsx
import { Details, Paragraph } from "shelving/ui";

<Details title="What is shelving?">
  <Paragraph>A TypeScript data toolkit.</Paragraph>
</Details>
```

### Open by default

```tsx
import { Details, Paragraph } from "shelving/ui";

<Details title="Release notes" open>
  <Paragraph>Bug fixes and small improvements.</Paragraph>
</Details>
```

### Exclusive group (FAQ)

```tsx
import { Details, Paragraph } from "shelving/ui";

// Only one answer is open at a time.
<Details name="faq" title="Is it free?">
  <Paragraph>Yes.</Paragraph>
</Details>
<Details name="faq" title="Does it work with React?">
  <Paragraph>Yes, through `shelving/ui`.</Paragraph>
</Details>
```

## Styling

`Details` paints from the [tint ladder](/ui/TINT_CLASS). Override these hooks at `:root` (or any ancestor scope) to retheme. Apply `color=` / `status=` to an ancestor scope to recolour the chevron and divider together.

| Variable | Styles | Default |
|---|---|---|
| `--details-space` | Outer block margin, and the padding above a divider | `var(--space-paragraph)` (16px) |
| `--details-border` | Divider between panels next to each other | `var(--stroke-normal) solid var(--tint-90)` |
| `--details-marker-color` | Colour of the browser's marker on a raw `<details>` in `.prose` | `var(--tint-80)` |
| `--details-radius` | Corner radius of the title's focus ring | `var(--radius-xsmall)` (8px) |
| `--details-icon-color` | Chevron colour | `var(--tint-50)` |
| `--details-transition` | Open/close animation and chevron turn | `all var(--duration-fast)` (150ms) |
| `--details-gap` | Space between the title and the content | `var(--space-paragraph)` (16px) |

**Global tokens it reads:** the tint ladder `--tint-50` / `--tint-80` / `--tint-90`, plus `--space-paragraph`, `--space-normal`, `--radius-xsmall`, `--stroke-normal`, `--stroke-focus`, `--color-focus`, `--duration-fast` and `--size-icon` (chevron size, from `getFlexClass`).
