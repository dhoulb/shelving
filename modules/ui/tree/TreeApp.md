# TreeApp

The entry point for a tree-based documentation site. Given a [`TreeElement`](/util/tree/TreeElement) from [extract](/extract), `TreeApp` produces a complete site in one line: a sidebar menu, client-side routing, and a rendered page for every element in the tree.

**Things to know:**

- It wraps [`<App>`](/ui/App) with error catching and a sidebar layout, then wires a [`TreeRouter`](/ui/TreeRouter) inside. The sidebar is always a [`TreeSidebar`](/ui/TreeSidebar) built from the root.
- The router covers the whole tree: `/` renders the root, and every deeper path resolves the matching descendant — both rendered via the default page renderers ([`TreePage`](/ui/TreePage) for directories/files, [`DocumentationPage`](/ui/DocumentationPage) for symbols).
- Only directories and files (plus `kind: "module"` symbols) appear in the navigation — code symbols are kept off the sidebar but still get their own pages.
- Every renderer is overridable. Each dispatch layer is a `[Mapping, Mapper]` pair built by [`createMapper()`](/ui/createMapper); wrap the app (or any subtree) in the matching `*Mapping` component to swap a renderer for one element type without touching anything else:

  | Mapping pair | Overrides |
  |---|---|
  | [`TreePageMapping`](/ui/TreeRouter) / [`TreeRouterMapper`](/ui/TreeRouterMapper) | Full-page renderer (dispatched by [`TreeRouter`](/ui/TreeRouter)) |
  | [`TreeMenuMapping`](/ui/TreeMenu) / [`TreeMenuMapper`](/ui/TreeMenuMapper) | Sidebar menu item |
  | [`TreeCardMapping`](/ui/TreeCards) / [`TreeCardMapper`](/ui/TreeCardMapper) | Card in a listing |

## Usage

### Basic

```tsx
import { TreeApp } from "shelving/ui";

// `tree` is a TreeElement returned by DirectoryExtractor (see /extract).
<TreeApp tree={tree} />
```

That single line produces a complete documentation site.

### Adding custom routes

Extra `routes` are merged before the tree routes, so they take precedence on conflicts.

```tsx
<TreeApp tree={tree} routes={{ "/changelog": ChangelogPage }} />
```

### Overriding a renderer

Wrap the app (or any subtree) in a `*Mapping` component to replace the renderer for one element type.

```tsx
import { TreeApp, TreePageMapping } from "shelving/ui";

<TreePageMapping mapping={{ "tree-element": MyTreePage }}>
  <TreeApp tree={tree} />
</TreePageMapping>
```

The same pattern works for [`TreeMenuMapping`](/ui/TreeMenu) (sidebar items) and [`TreeCardMapping`](/ui/TreeCards) (cards inside directory listings).

## See also

- [extract](/extract) — builds the `TreeElement` tree that `TreeApp` consumes.
- [`TreeRouter`](/ui/TreeRouter) — resolves the URL to an element and dispatches it to a page renderer.
- [`TreeSidebar`](/ui/TreeSidebar) / [`TreeMenu`](/ui/TreeMenu) — the navigation built into the sidebar.
- [`TreePage`](/ui/TreePage) / [`TreeCards`](/ui/TreeCards) — the default directory/file page and card listing.
- [`DocumentationPage`](/ui/DocumentationPage) — the default renderer for documented symbols.
