# DocumentationHomePage

The landing page for a documentation site — a bold coloured hero panel with the package name, sitting above the listing of every module. Swap it in for the root element via [`TreeRouterMapping`](/ui/TreeRouter) so the home route (`/`) renders this instead of the generic [`TreePage`](/ui/TreePage).

**Things to know:**

- The whole page sits inside one `color="red"` [`Block`](/ui/Block), so the hero [`Panel`](/ui/Panel), prose, and child [`DocumentationCard`](/ui/DocumentationCard)s all inherit the red tint and re-derive together.
- The hero is a `padding="5x"` [`Panel`](/ui/Panel) with the package name centred as a [`Title`](/ui/Title) (`center`).
- Below the hero it renders any absorbed README prose, then the root's children (the modules) as a stack of cards via [`TreeCards`](/ui/TreeCards).
- It consumes the same [`TreeElementProps`](/util/tree) as [`TreePage`](/ui/TreePage), so it's a drop-in replacement for the `tree-element` renderer.

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

`DocumentationHomePage` has no own CSS hooks — it composes [`Page`](/ui/Page), [`Block`](/ui/Block), [`Panel`](/ui/Panel), [`Title`](/ui/Title), [`Section`](/ui/Section), and [`TreeCards`](/ui/TreeCards), which carry their own themeable surfaces. Retheme through those, or change the hero colour via the `color=` on the wrapping `Block`.

## See also

- [`TreePage`](/ui/TreePage) — the generic `tree-element` renderer this replaces for the home route.
- [`DocumentationPage`](/ui/DocumentationPage) — the per-symbol detail page that uses the same coloured-panel hero pattern.
- [`Panel`](/ui/Panel) — the full-width hero band, here with `padding="5x"`.
- [`TreeCards`](/ui/TreeCards) — the module card listing rendered below the hero.
- [`TreeApp`](/ui/TreeApp) — wires renderers into a complete site.
