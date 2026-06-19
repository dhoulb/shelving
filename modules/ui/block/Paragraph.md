# Paragraph

A block of body text — renders a `<p>`. The default container for running prose between headings, lists, and other blocks.

**Things to know:**

- Carries its own outer block margin and collapses it when it is the first or last child of its container, so stacked paragraphs space evenly without doubling up at the edges.
- Accepts `color=` and the typography variants (`size`, `serif`, `center`, …) to retint or restyle the text.
- Fill it with inline annotations such as [`<Strong>`](/ui/Strong), [`<Emphasis>`](/ui/Emphasis), [`<Code>`](/ui/Code), [`<Mark>`](/ui/Mark), and [`<Link>`](/ui/Link).
- Inside [`<Prose>`](/ui/Prose) a raw `<p>` picks up the same styling, so Markdown-rendered paragraphs match component ones.

## Usage

### Body text

```tsx
import { Paragraph } from "shelving/ui";

<Paragraph>The best widget on the market.</Paragraph>
```

### With inline annotations

```tsx
import { Paragraph, Strong, Link } from "shelving/ui";

<Paragraph>
  <Strong>Note:</Strong> read our <Link href="/privacy">privacy policy</Link> first.
</Paragraph>
```

## Styling

`Paragraph` exposes a single hook for its own block margin and rebinds the tint anchor for its scope; it paints no colour of its own, so it inherits the surrounding text colour.

| Variable | Styles | Default |
|---|---|---|
| `--paragraph-tint` | Tint anchor for the paragraph scope | `inherit` (flows from `color=` / parent) |
| `--paragraph-space` | Outer block margin (top + bottom) | `var(--space-paragraph)` (16px) |

**Global tokens it reads:** [`--space-paragraph`](/ui/getSpaceClass).
