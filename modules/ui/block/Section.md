# Section

A landmark content region — renders a `<section>` with block-level spacing and a constrained content width. `Section.tsx` exports the whole family of semantic landmarks (`<Section>`, `<Header>`, `<Footer>`, `<Figure>`) — they share `SectionProps` and differ only in the HTML element they render.

**Things to know:**

- Pick the component whose HTML element matches the semantic meaning rather than reaching for a generic `<Block>`. `<Section>` is a `<section>`, `<Figure>` a `<figure>`, and so on.
- Every section centres its content and caps the line length, but it adds **no inline padding of its own**, so its content can run to the edge of its container. Keep content off the edges by placing the section inside something that already pads — a `<Panel>`, a `<Block indent="normal">`, or a layout that pads its scroll area — or by giving the section its own `indent` variant (`<Section indent="normal">`).
- Sections default to the `--width-normal` content width, so most of the time you set no width at all. Pass `width="narrow"` / `"wide"` / `"full"` (or `"fit"`) to change that, and the usual `color` / `space` / `indent` / typography variants to retint, respace, and inset.
- Pair `Figure` with `<Caption>` for a `<figure>` / `<figcaption>` pair.

## Usage

### Structured page section

```tsx
import { Section, Heading, Definitions } from "shelving/ui";

<Section width="narrow">
  <Heading>Account details</Heading>
  <Definitions>
    <dt>Name</dt><dd>Alice Smith</dd>
    <dt>Email</dt><dd>alice@example.com</dd>
    <dt>Plan</dt><dd>Pro</dd>
  </Definitions>
</Section>
```

### Landmark elements

```tsx
import { Header, Nav, Footer } from "shelving/ui";

<Header><Title>Welcome</Title></Header>
<Nav><Link href="/">Home</Link></Nav>
<Footer><Small>© 2026</Small></Footer>
```

## Styling

`Section` exposes hooks for its width and rhythm; it paints no colour of its own, so it inherits the surrounding tint.

| Variable | Styles | Default |
|---|---|---|
| `--section-width` | Content width | `var(--width-normal)` (55rem) |
| `--section-space` | Outer block margin (top + bottom) | `var(--space-section)` (2rem) |

**Global tokens it reads:** `--space-section` and `--width-normal` (the default content width). The `width` variant (`narrow` / `normal` / `wide` / `full` / `fit`) and the `indent` variant (inline padding, via `getIndentClass()`) come from the shared `shelving/ui` styling system.
