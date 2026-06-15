# Prose

A wrapper that applies cohesive longform typography to a subtree of mixed HTML content. Wrap any block of paragraphs, lists, headings, code, tables, and inline annotations in `<Prose>` and they pick up the right spacing and type in one step — including raw HTML elements emitted by a markup renderer.

**Things to know:**

- `Prose` applies the "prose" variant of *every* block and inline component as a single compound class, so raw `<p>`, `<ul>`, `<h2>`, `<code>`, `<a>`, etc. are styled to match their component counterparts ([`Paragraph`](/ui/Paragraph), [`List`](/ui/List), [`Heading`](/ui/Heading), [`Code`](/ui/Code), [`Link`](/ui/Link), …).
- This is the bridge for markup: wrap [`Markup`](/markup) output (or anything that emits raw HTML) in `<Prose>` and it just works — no per-element component wrapping needed.
- It only sets up typography and its own outer margin; it paints no colour and adds no box of its own.

## Usage

### Prose content from a renderer

```tsx
import { Prose, Markup } from "shelving/ui";

<Prose>
  <Markup>{article.body}</Markup>
</Prose>
```

### Hand-written longform

```tsx
import { Prose, Paragraph } from "shelving/ui";

<Prose>
  <Paragraph>First.</Paragraph>
  <Paragraph>Second.</Paragraph>
</Prose>
```

## Styling

`Prose` exposes a single hook for its own block margin. The longform typography of nested content is themed through each block/inline component's own hooks (e.g. `--paragraph-space`, `--heading-size`), not through `Prose` itself.

| Variable | Styles | Default |
|---|---|---|
| `--prose-space` | Outer block margin (top + bottom) | `var(--space-paragraph)` (16px) |

**Global tokens it reads:** `--space-paragraph`.

## See also

- [`Paragraph`](/ui/Paragraph) — body text; its prose variant styles raw `<p>` inside `Prose`.
- [`List`](/ui/List) — its prose variant styles raw `<ul>` / `<ol>` inside `Prose`.
- [`Markup`](/markup) — renders a markup string into the raw HTML that `Prose` styles.
- [`ui`](/ui) — the styling system and per-component theming hooks.
