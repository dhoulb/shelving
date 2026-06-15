# DocumentationPage

The full detail page for a documented symbol — the default renderer for `tree-documentation` elements dispatched by [`TreeApp`](/ui/TreeApp). It is the most detailed page renderer in the tree shell; render it directly only when you need a symbol page outside the tree, or replace it for one element type via [`TreePageMapping`](/ui/TreeRouter).

**Things to know:**

- Above the title it renders an ancestor trail via [`TreeBreadcrumbs`](/ui/TreeBreadcrumbs), so it needs a [`TreeProvider`](/ui/TreeProvider) above it to resolve the ancestors.
- The title carries a [`DocumentationKind`](/ui/DocumentationKind) tag, and below it [`DocumentationButtons`](/ui/DocumentationButtons) lists the symbol's relations (`member of`, `extends`, `implements`) as links.
- It renders the signature(s) via [`DocumentationSignatures`](/ui/DocumentationSignatures) (one block per overload, each carrying the symbol's name), then prose content, then conditional `Parameters` / `Returns` / `Throws` / `Examples` sections — each only appears when it has entries. Parameters render as a [`Table`](/ui/Table) (`Parameter` / `Default` / `Description` columns, a `-` standing in where a parameter has no default); Returns and Throws render as two-column tables (`Return` / `Throws` plus `Description`).
- Child symbols follow, grouped by `kind` into card sections (`Components`, `Functions`, `Classes`, `Interfaces`, `Types`, `Constants`, `Methods`, `Properties`) rendered as [`DocumentationCard`](/ui/DocumentationCard)s inside a [`TreeCards`](/ui/TreeCards) listing. A new documented kind needs an entry in `KIND_SECTIONS` here (and a colour in [`DocumentationKind`](/ui/DocumentationKind)).

## Usage

Used automatically by [`TreeApp`](/ui/TreeApp). To render a single page manually, spread the element's flattened props.

```tsx
import { DocumentationPage } from "shelving/ui";

// `element` is a `tree-documentation` element from DirectoryExtractor (see /extract).
<DocumentationPage {...element.props} />
```

To replace this renderer across the whole site, wrap the app in [`TreePageMapping`](/ui/TreeRouter).

```tsx
import { TreeApp, TreePageMapping } from "shelving/ui";

<TreePageMapping mapping={{ "tree-documentation": MyDocumentationPage }}>
  <TreeApp tree={tree} />
</TreePageMapping>
```

## Styling

`DocumentationPage` has no own CSS hooks — it composes [`Page`](/ui/Page), [`Panel`](/ui/Panel), [`Section`](/ui/Section), and the other block components, which carry their own themeable surfaces. Retheme through those.

## See also

- [`DocumentationCard`](/ui/DocumentationCard) — the compact card form of a symbol, used for the child sections here.
- [`DocumentationButtons`](/ui/DocumentationButtons) — the relations nav rendered below the title.
- [`DocumentationKind`](/ui/DocumentationKind) — the colour-coded kind tag carried by the title.
- [`DocumentationSignatures`](/ui/DocumentationSignatures) — renders the symbol's signature blocks.
- [`TreeApp`](/ui/TreeApp) — wires this renderer into a complete site via the page mappers.
- [`TreeBreadcrumbs`](/ui/TreeBreadcrumbs) — the ancestor trail rendered above the title.
- [extract](/extract) — produces the `TreeElement` tree whose props this renderer consumes.
- [markup](/markup) — renders the Markdown `content` field carried by each element.
