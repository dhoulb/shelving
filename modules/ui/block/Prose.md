# Prose

A wrapper that applies cohesive longform typography to a subtree of mixed HTML content. Wrap any block of paragraphs, lists, headings, code, tables, and inline annotations in `<Prose>` and they pick up the right spacing and type in one step — including raw HTML elements emitted by a markup renderer.

**Things to know:**

- `Prose` applies the "prose" variant of *every* block and inline component as a single compound class, so raw `<p>`, `<ul>`, `<h2>`, `<code>`, `<a>`, etc. are styled to match their component counterparts (`<Paragraph>`, `<List>`, `<Heading>`, `<Code>`, `<Link>`, …).
- This is the bridge for markup: wrap `shelving/markup` output (or anything that emits raw HTML) in `<Prose>` and it just works — no per-element component wrapping needed.
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

`Prose` exposes no own hooks. It only stamps the "prose" variant class onto its `<div>`; the longform typography of nested content is themed through each block/inline component's own hooks (e.g. `--paragraph-space`, `--heading-size`), not through `Prose` itself.
