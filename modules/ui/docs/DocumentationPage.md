# DocumentationPage

The full detail page for a documented symbol — the default renderer for `tree-documentation` elements dispatched by `<TreeApp>`. It is the most detailed page renderer in the tree shell; render it directly only when you need a symbol page outside the tree, or replace it for one element type via `TreePageMapping`.

**Things to know:**

- Above the title it renders an ancestor trail via `<TreeBreadcrumbs>`, so it needs a `<TreeProvider>` above it to resolve the ancestors.
- The title carries a `<DocumentationKind>` tag, and below it `<DocumentationButtons>` lists the symbol's relations (`member of`, `extends`, `implements`) as links.
- It renders the signature(s) via `<DocumentationSignatures>` (one block per overload, each carrying the symbol's name), then prose content, then conditional `Parameters` / `Returns` / `Throws` / `Examples` sections — each only appears when it has entries. Parameters render as a `<Table>` (`Param` / `Type` / `Default` / `Description` columns, a `-` standing in where a parameter has no default); Returns and Throws render as two-column tables (`Return` / `Throws` plus `Description`), with the type in the first column.
- Child symbols follow, grouped by `kind` into card sections (`Modules`, `Components`, `Functions`, `Classes`, `Interfaces`, `Types`, `Constants`, `Static methods`, `Methods`) rendered as `<DocumentationCard>`s inside a `<TreeCards>` listing. Data members (properties) are not child elements — they render as the Properties table instead. A new documented kind needs an entry in `KINDS` here (and a colour in `<DocumentationKind>`).

## Usage

Used automatically by `<TreeApp>`. To render a single page manually, spread the element's flattened props.

```tsx
import { DocumentationPage } from "shelving/ui";

// `element` is a `tree-documentation` element from DirectoryExtractor (see /extract).
<DocumentationPage {...element.props} />
```

To replace this renderer across the whole site, wrap the app in `TreePageMapping`.

```tsx
import { TreeApp, TreePageMapping } from "shelving/ui";

<TreePageMapping mapping={{ "tree-documentation": MyDocumentationPage }}>
  <TreeApp tree={tree} />
</TreePageMapping>
```

## Styling

`DocumentationPage` has no own CSS hooks — it composes `<Page>`, `<Panel>`, `<Section>`, and the other block components, which carry their own themeable surfaces. Retheme through those.
