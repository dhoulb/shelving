# DocumentationHomePage

The landing page for a documentation site — a bold coloured hero panel with the package name, sitting above the listing of every module. Swap it in for the root element via `TreeRouterMapping` so the home route (`/`) renders this instead of the generic `<TreePage>`.

**Things to know:**

- The whole page sits inside one `color="red"` `<Block>`, so the hero `<Panel>`, prose, and child `<DocumentationCard>`s all inherit the red tint and re-derive together.
- The hero is a `padding="5x"` `<Panel>` with the package name centred as a `<Title>` (`center`).
- Below the hero it renders any absorbed README prose, then the root's children (the modules) as a stack of cards via `<TreeCards>`.
- It consumes the same `shelving/util/tree` as `<TreePage>`, so it's a drop-in replacement for the `tree-element` renderer.

## Usage

Wire it in as the renderer for the root `tree-element` so the home route uses it:

```tsx
import { DocumentationHomePage, TreeApp, TreeRouterMapping } from "shelving/ui";

<TreeRouterMapping mapping={{ "tree-element": DocumentationHomePage }}>
  <TreeApp tree={tree} />
</TreeRouterMapping>
```

Or render a single page manually by spreading the root element's props:

```tsx
import { DocumentationHomePage } from "shelving/ui";

<DocumentationHomePage {...root.props} />
```

## Styling

`DocumentationHomePage` has no own CSS hooks — it composes `<Page>`, `<Block>`, `<Panel>`, `<Title>`, `<Section>`, and `<TreeCards>`, which carry their own themeable surfaces. Retheme through those, or change the hero colour via the `color=` on the wrapping `Block`.
