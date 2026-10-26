# TreeApp

- Kind: component
- Import: `import { TreeApp } from "shelving/ui";`

Top-level app component for a tree-based documentation site.

- Wraps `<App>` with error catching and a sidebar layout.
- Flattens `tree` once via `<TreeProvider>` wrapping both the sidebar and the router, so everything below shares a single `useTreeMap()` lookup — nothing re-flattens.
- The sidebar shows a `<TreeSidebar>` (root as a home link + a menu of its children).
- `/` renders the root via `<TreePage>`; `/**` catches every deeper path and feeds the full sub-path into `<TreePage>`.
- Element rendering uses the default mappings on `<TreePage>`, `<TreeMenu>`, `<TreeCards>`.
  Override by wrapping with `<TreePageMapping>`, `<TreeMenuMapping>`, or `<TreeCardMapping>`.

The entry point for a tree-based documentation site. Given a `TreeElement` from `shelving/extract`, `TreeApp` produces a complete site in one line: a sidebar menu, client-side routing, and a rendered page for every element in the tree.

**Things to know:**

- It wraps `<App>` with error catching and a sidebar layout, then wires a `<TreeRouter>` inside. The sidebar is always a `<TreeSidebar>` built from the root.
- The router covers the whole tree: `/` renders the root, and every deeper path resolves the matching descendant — both rendered via the default page renderers (`<TreePage>` for directories/files, `<DocumentationPage>` for symbols).
- Only directories and files (plus `kind: "module"` symbols) appear in the navigation — code symbols are kept off the sidebar but still get their own pages.
- Every renderer is overridable. Each dispatch layer is a `[Mapping, Mapper]` pair built by `createMapper()`; wrap the app (or any subtree) in the matching `*Mapping` component to swap a renderer for one element type without touching anything else:

  | Mapping pair | Overrides |
  |---|---|
  | `TreePageMapping` / `TreeRouterMapper` | Full-page renderer (dispatched by `<TreeRouter>`) |
  | `TreeMenuMapping` / `TreeMenuMapper` | Sidebar menu item |
  | `TreeCardMapping` / `TreeCardMapper` | Card in a listing |

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

The same pattern works for `TreeMenuMapping` (sidebar items) and `TreeCardMapping` (cards inside directory listings).


## Signatures

```ts
TreeApp({ tree, routes, sidebar = <TreeSidebar />, ...meta }: TreeAppProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `TreeAppProps` |  |
| `.tree` | `TreeElement` | The tree elements to display. |
| `.sidebar` | `ReactElement \| undefined` | Override the sidebar for the tree app. Defaults to `<TreeSidebar />`. |
| `.routes` | `Routes \| undefined` | Additional routes. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |
