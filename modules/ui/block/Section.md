# Section

A landmark content region — renders a `<section>` with block-level spacing and a constrained content width. `Section.tsx` exports the whole family of semantic landmarks (`Section`, `Header`, `Footer`, `Nav`, `Aside`, `Figure`) — they share `SectionProps` and differ only in the HTML element they render.

**Things to know:**

- Pick the component whose HTML element matches the semantic meaning rather than reaching for a generic [`<Block>`](/ui/Block). `<Section>` is a `<section>`, `<Nav>` a `<nav>`, `<Figure>` a `<figure>`, and so on.
- Every section centres its content and caps the line length so text never touches the viewport edges. Nested sections relax that cap so they can fill their parent.
- Sections default to the `--width-normal` content width, so most of the time you set no width at all. Pass `width="narrow"` / `"wide"` / `"full"` (or `"fit"`) to change that, and the usual `color` / `space` / typography variants to retint and respace.
- Pair [`Figure`](/ui/Section) with [`<Caption>`](/ui/Caption) for a `<figure>` / `<figcaption>` pair.

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
| `--section-indent` | Inline gutter kept on each side so text doesn't touch the edges | `var(--space-normal)` (16px) |
| `--section-space` | Outer block margin (top + bottom) | `var(--space-section)` (2rem) |

**Global tokens it reads:** [`--space-normal`](/ui/getSpaceClass), [`--space-section`](/ui/getSpaceClass), and [`--width-normal`](/ui/getWidthClass) (the default content width). The `width` variant (`narrow` / `normal` / `wide` / `full` / `fit`) comes from the shared [`shelving/ui`](/ui) styling system.
