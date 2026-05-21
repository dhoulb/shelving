# Block content

Block-level components for structuring page content. Every component here maps to a semantic HTML element and applies consistent spacing, typography, and layout from the design system's CSS modules.

## Concepts

### Semantic HTML, no custom markup

Each component is a thin styled wrapper around a single HTML element: `<Card>` renders `<article>`, `<Section>` renders `<section>`, `<Table>` renders `<table>`, and so on. Pick the component whose HTML element fits the semantic meaning — do not reach for a `<Block>` or `<Flex>` when a `<Section>` or `<List>` is the right choice.

`Section.tsx` exports all the standard landmark elements under the same variants (`narrow`, `wide`, `spacious`): `Section`, `Header`, `Footer`, `Nav`, and `Aside`.

### Width and layout variants

Several layout components accept `narrow` and `wide` boolean props that constrain content width within the parent. `<Flex>` has richer layout control with `column`, `wrap`, `left`, `center`, `right`, `flush`, and `reverse` variants.

### `<Prose>` for longform text

Wrap any block of mixed HTML content (paragraphs, lists, headings, code, tables) in `<Prose>` to apply cohesive longform typography in one step. All the inline and block component styles are applied as a compound class, so raw HTML elements produced by a markdown renderer just work.

### Compound components

Some block components ship multiple pieces intended to compose:

- `Video` + `VideoButtons` + `VideoButton` + `FullscreenVideoButton`
- `Definitions` + `Definition` (term/value pairs inside a `<dl>`)
- `Address`, `PhysicalAddress`, `EmailAddress`

## Canonical usage examples

### Content card with a heading

```tsx
import { Card, Heading, Paragraph } from "shelving/ui";

<Card href="/products/42" title="Open product">
  <Heading level={2}>Widget Pro</Heading>
  <Paragraph>The best widget on the market.</Paragraph>
</Card>
```

`href` turns the card into a navigable overlay. Real interactive elements inside (like inline `<Link>` components) stay clickable via `position: relative; z-index: 2` rules in the stylesheet.

### Structured page section

```tsx
import { Section, Heading, Definitions, Definition } from "shelving/ui";

<Section narrow>
  <Heading>Account details</Heading>
  <Definitions row>
    <Definition term="Name">Alice Smith</Definition>
    <Definition term="Email">alice@example.com</Definition>
    <Definition term="Plan">Pro</Definition>
  </Definitions>
</Section>
```

`<Subheading>` uses the same `level` prop as `<Heading>` but applies secondary typography styles — use it for in-section labels and panel titles.

### Prose content from a renderer

```tsx
import { Prose, Markup } from "shelving/ui";

<Prose>
  <Markup>{article.body}</Markup>
</Prose>
```

Wrap `<Markup>` (or any component that emits raw HTML elements) in `<Prose>` to apply consistent longform typography.

### Flex row of cards

```tsx
import { Flex, Card, Heading } from "shelving/ui";

<Flex wrap>
  {products.map(p => (
    <Card key={p.id} href={`/products/${p.id}`}>
      <Heading level={3}>{p.name}</Heading>
    </Card>
  ))}
</Flex>
```

### Figure with caption

```tsx
import { Figure, Image } from "shelving/ui";

<Figure caption="A golden retriever at the park">
  <Image src="/images/dog.jpg" alt="Golden retriever" />
</Figure>
```

### Video with controls

```tsx
import { Video, VideoButtons, FullscreenVideoButton } from "shelving/ui";

<Video wide>
  <video src={stream.url} autoPlay muted playsInline />
  <VideoButtons>
    <FullscreenVideoButton />
  </VideoButtons>
</Video>
```

## See also

- [ui/inline](/ui/inline) — inline-level text components used inside block content
- [ui/misc/Markup](/ui/misc) — renders a markup string into block and inline elements
- [ui/form](/ui/form) — interactive form elements and buttons
- [ui/layout](/ui/layout) — page-level layout structures
