# Heading

A section heading — renders an `<h2>`. It sits in the middle of the three-level heading family: `Title` (`<h1>`), `Heading` (`<h2>`), `Subheading` (`<h3>`).

**Things to know:**

- Pick the component that matches the level rather than overriding `level`. Choosing `Title` / `Heading` / `Subheading` keeps the visual size and the document outline in step, which matters for accessibility and the docs-site table of contents.
- The `level` prop (`1`–`6`) is an escape hatch for the rare case where the outline level must differ from the visual size — avoid it in normal use.
- Inside `Prose`, an `<h2>` is styled by the same rules (`HEADING_PROSE_CLASS`), so Markdown-rendered headings match component ones.
- Accepts `color=` and the typography variants; like all block components it collapses its outer margin when it's the first/last child of its container.

## Usage

### Section heading

```tsx
import { Heading, Paragraph } from "shelving/ui";

<Heading>Billing</Heading>
<Paragraph>Manage your plan and payment method.</Paragraph>
```

### The heading family together

```tsx
import { Title, Heading, Subheading } from "shelving/ui";

<Title>Account</Title>        {/* <h1> */}
<Heading>Security</Heading>   {/* <h2> */}
<Subheading>Sessions</Subheading> {/* <h3> */}
```

### Coloured heading

```tsx
import { Heading } from "shelving/ui";

<Heading color="red">Danger zone</Heading>
```

## Styling

`Heading` exposes hooks for its rhythm and type. It inherits text colour by default (so it picks up the surrounding tint); set `--heading-color` only to override that.

| Variable | Styles | Default |
|---|---|---|
| `--heading-tint` | Tint anchor for the heading scope | `inherit` (flows from `color=` / parent) |
| `--heading-color` | Text colour | `inherit` |
| `--heading-space-before` | Top margin | `var(--space-section)` (2rem) |
| `--heading-space` | Bottom margin | `var(--space-paragraph)` (16px) |
| `--heading-font` | Font family | `var(--font-title)` |
| `--heading-weight` | Font weight | `var(--weight-strong)` (700) |
| `--heading-size` | Font size | `var(--size-xxlarge)` |
| `--heading-leading` | Line height | `var(--leading)` |

**Global tokens it reads:** `--space-section`, `--space-paragraph`, `--font-title`, `--weight-strong`, `--size-xxlarge`, and `--leading`. (`Title` and `Subheading` share this component and expose the parallel `--title-*` / `--subheading-*` hooks.)

```css
/* Theme: serif headings, a touch larger. */
:root {
  --heading-font: var(--font-serif);
  --heading-size: var(--size-xxxlarge);
}
```

## See also

- [`Title`](/ui/Title) — the top-level page heading that pairs with `Heading`.
- [`Section`](/ui/Section) — wraps a heading and its content as a titled section.
- [`ui`](/ui) — the styling system: tint ladder, typography variants, and theming.
