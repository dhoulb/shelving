# Block content

Block-level components for structuring page content. Every component here maps to a semantic HTML element and applies consistent spacing, typography, and layout from the design system's CSS modules.

## Concepts

### Semantic HTML, no custom markup

Each component is a thin styled wrapper around a single HTML element: `<Card>` renders `<article>`, `<Section>` renders `<section>`, `<Table>` renders `<table>`, and so on. Pick the component whose HTML element fits the semantic meaning — do not reach for a `<Block>` when a `<Section>` or `<List>` is the right choice.

[Section.tsx](./Section.tsx) exports all the standard landmark elements with the same props: `Section`, `Header`, `Footer`, `Nav`, `Aside`, and `Figure`. `<Panel>` is the odd one out — a full-width region that paints the current surface colour, used to break a page into stacked bands.

### Styling props

Block components share the styling props defined in [ui/style](../style/) — see the [ui README](../README.md) for the full system. The ones you'll use most here:

- `space="none"` … `space="xxlarge"` — block margin (top + bottom). Every block has a sensible default; first and last children collapse their outer margins automatically.
- `color="red"`, `status="error"` — retint the component and everything nested inside it.
- `size="large"`, `code`, `serif`, `center` — typography overrides.
- `narrow` / `wide` / `full` — constrain or unconstrain content width within the parent.
- `gap="small"` — item spacing on `<List>` and flex containers.

### `<Prose>` for longform text

Wrap any block of mixed HTML content (paragraphs, lists, headings, code, tables) in `<Prose>` to apply cohesive longform typography in one step. All the inline and block component styles are applied as a compound class, so raw HTML elements produced by a markdown renderer just work.

### Compound components

Some block components ship multiple pieces intended to compose:

- `Figure` + `Caption` (a `<figure>` with its `<figcaption>`)
- `Video` + `VideoButtons` + `VideoButton` + `FullscreenVideoButton`
- `Definitions` (raw `<dt>` / `<dd>` term/value pairs inside a styled `<dl>`)
- `Address`, `PhysicalAddress`, `EmailAddress`

## Canonical usage examples

### Content card with a heading

```tsx
import { Card, Paragraph, Subheading } from "shelving/ui";

<Card href="/products/42" title="Open product">
  <Subheading>Widget Pro</Subheading>
  <Paragraph>The best widget on the market.</Paragraph>
</Card>
```

`href` turns the card into a navigable overlay. Real interactive elements inside (like inline `<Link>` components) stay clickable via `position: relative; z-index: 2` rules in the stylesheet.

`<Card>` also accepts `status` and `color` — `<Card status="error">` for a prominent error panel, `<Card color="purple">` for decorative tinting. The card styles the box and its tint cascades into nested content; compose its contents however the use case needs.

### Structured page section

```tsx
import { Section, Heading, Definitions } from "shelving/ui";

<Section narrow>
  <Heading>Account details</Heading>
  <Definitions>
    <dt>Name</dt><dd>Alice Smith</dd>
    <dt>Email</dt><dd>alice@example.com</dd>
    <dt>Plan</dt><dd>Pro</dd>
  </Definitions>
</Section>
```

`<Title>`, `<Heading>`, and `<Subheading>` render `<h1>`, `<h2>`, and `<h3>` respectively — pick the component that matches the level rather than overriding it with the `level` prop. Use `<Subheading>` for card titles, in-section labels, and panel titles.

### Page banded into panels

```tsx
import { Panel, Block, Title, Paragraph } from "shelving/ui";

<Panel as="header" color="primary">
  <Block narrow>
    <Title>Welcome</Title>
  </Block>
</Panel>
<Panel padding="large">
  <Block narrow>
    <Paragraph>Each panel is a full-width band; the inner block constrains the content.</Paragraph>
  </Block>
</Panel>
```

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
import { Card, Flex, Subheading } from "shelving/ui";

<Flex wrap gap="small">
  {products.map(p => (
    <Card key={p.id} href={`/products/${p.id}`}>
      <Subheading>{p.name}</Subheading>
    </Card>
  ))}
</Flex>
```

`<Flex>` is a dumb flex box: `column` switches direction, `wrap` allows wrapping, and the justify/align booleans (`left`, `center`, `right`, `between`, `top`, `middle`, `bottom`, …) position children along each axis. It carries no outer spacing of its own.

### Figure with caption

```tsx
import { Figure, Image, Caption } from "shelving/ui";

<Figure>
  <Image src="/images/dog.jpg" alt="Golden retriever" />
  <Caption>A golden retriever at the park</Caption>
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
