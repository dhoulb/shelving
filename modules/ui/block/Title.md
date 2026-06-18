# Title

The top-level page heading — renders an `<h1>`. It is the most prominent member of the three-level heading family: `Title` (`<h1>`), [`Heading`](/ui/Heading) (`<h2>`), [`Subheading`](/ui/Subheading) (`<h3>`). There should normally be exactly one `Title` per page.

**Things to know:**

- Pick the component that matches the level rather than overriding `level`. Choosing `Title` / [`<Heading>`](/ui/Heading) / [`<Subheading>`](/ui/Subheading) keeps the visual size and the document outline in step.
- The `level` prop (`1`–`6`) is an escape hatch for the rare case where the outline level must differ from the visual size — avoid it in normal use.
- Inherits text colour by default so it picks up the surrounding tint; accepts `color=` and the typography variants.
- Inside [`Prose`](/ui/Prose) a raw `<h1>` is styled by the same rules, so Markdown-rendered titles match component ones.

## Usage

### Page title

```tsx
import { Title, Paragraph } from "shelving/ui";

<Title>Account</Title>
<Paragraph>Manage your profile and settings.</Paragraph>
```

### Inside a panel header

```tsx
import { Panel, Block, Title } from "shelving/ui";

<Panel as="header" color="primary">
  <Block width="narrow">
    <Title>Welcome</Title>
  </Block>
</Panel>
```

## Styling

`Title` exposes hooks for its rhythm and type. It inherits text colour by default; set `--title-color` only to override that.

| Variable | Styles | Default |
|---|---|---|
| `--title-tint` | Tint anchor for the title scope | `inherit` (flows from `color=` / parent) |
| `--title-color` | Text colour | `inherit` |
| `--title-space-before` | Top margin | `var(--space-section)` (2rem) |
| `--title-space` | Bottom margin | `var(--space-paragraph)` (16px) |
| `--title-font` | Font family | `var(--font-title)` |
| `--title-weight` | Font weight | `var(--weight-strong)` (700) |
| `--title-size` | Font size | `var(--size-xxxlarge)` |
| `--title-leading` | Line height | `var(--leading)` |

**Global tokens it reads:** [`--space-section`](/ui/getSpaceClass), [`--space-paragraph`](/ui/getSpaceClass), [`--font-title`](/ui/getFontClass), [`--weight-strong`](/ui/getWeightClass), [`--size-xxxlarge`](/ui/getSizeClass), and [`--leading`](/ui/getSizeClass).
