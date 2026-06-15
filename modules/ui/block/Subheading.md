# Subheading

A subsection heading — renders an `<h3>`. It is the smallest member of the three-level heading family: [`Title`](/ui/Title) (`<h1>`), [`Heading`](/ui/Heading) (`<h2>`), `Subheading` (`<h3>`). Use it for card titles, in-section labels, and panel titles.

**Things to know:**

- Only marginally larger than body text; its bold weight is the main differentiator.
- Pick the component that matches the level rather than overriding `level` — that keeps the visual size and the document outline in step.
- The `level` prop (`1`–`6`) is an escape hatch for the rare case where the outline level must differ from the visual size — avoid it in normal use.
- Inherits text colour by default so it picks up the surrounding tint; accepts `color=` and the typography variants.
- Inside [`Prose`](/ui/Prose) raw `<h3>`–`<h6>` are styled by the same rules, so Markdown-rendered subheadings match component ones.

## Usage

### Card title

```tsx
import { Card, Subheading, Paragraph } from "shelving/ui";

<Card>
  <Subheading>Storage</Subheading>
  <Paragraph>1.2 GB of 5 GB used.</Paragraph>
</Card>
```

### The heading family together

```tsx
import { Title, Heading, Subheading } from "shelving/ui";

<Title>Account</Title>            {/* <h1> */}
<Heading>Security</Heading>       {/* <h2> */}
<Subheading>Sessions</Subheading> {/* <h3> */}
```

## Styling

`Subheading` exposes hooks for its rhythm and type. It inherits text colour by default; set `--subheading-color` only to override that.

| Variable | Styles | Default |
|---|---|---|
| `--subheading-tint` | Tint anchor for the subheading scope | `inherit` (flows from `color=` / parent) |
| `--subheading-color` | Text colour | `inherit` |
| `--subheading-space-before` | Top margin | `var(--space-section)` (2rem) |
| `--subheading-space` | Bottom margin | `var(--space-paragraph)` (16px) |
| `--subheading-font` | Font family | `var(--font-title)` |
| `--subheading-weight` | Font weight | `var(--weight-strong)` (700) |
| `--subheading-size` | Font size | `var(--size-large)` |
| `--subheading-leading` | Line height | `var(--leading)` |

**Global tokens it reads:** `--space-section`, `--space-paragraph`, `--font-title`, `--weight-strong`, `--size-large`, and `--leading`.

## See also

- [`Heading`](/ui/Heading) — the `<h2>` section heading one level up.
- [`Title`](/ui/Title) — the top-level page `<h1>`.
- [`Card`](/ui/Card) — a boxed surface whose title is usually a `Subheading`.
- [`ui`](/ui) — the styling system: tint ladder, typography variants, and theming.
