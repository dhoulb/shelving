# Tree components

Shell components for a tree-based documentation site. Given a `TreeElement` from [extract](/extract), these components produce a complete site: a sidebar menu, client-side routing, and a rendered page for every element.

## Concepts

**`<TreeApp>` is the entry point.** It wraps `<App>` with error catching and a sidebar layout, then wires `<Navigation>` and a `<Router>` covering two routes: `/` renders the root via `<TreePage>`, and `/{...path}` passes every deeper URL to `<TreePage>` as well. The sidebar is always a `<TreeSidebar>`.

**`<TreeRouter>` resolves and dispatches.** It resolves the current URL to an element with a single `map.get(path)` against the flattened tree (provided by `<TreeProvider>`), then hands the matched element to the right page renderer via `<TreeRouterMapper>`. It throws `NotFoundError` if nothing matches and no `fallback` is given.

**`<TreeMenu>` and `<TreeSidebar>` build navigation.** `<TreeSidebar>` renders a single home link for the root, then its children via `<TreeMenuMapper>`. `<TreeMenu>` renders a menu from a tree element's children directly. Only generic `tree-element` nodes appear — code symbols are kept off the navigation.

**`<TreeCards>` renders a card list.** It dispatches each child element to a card renderer via `<TreeCardMapper>`; each card links straight to its element's stamped `path`. Used by the page renderers in [ui/docs](/ui/docs) to fill out directory and file pages.

**`<TreeProvider>` flattens the tree — the one transform the UI runs on.** It flattens the tree once (via `flattenTree()`), which stamps a canonical `path` on every element and indexes them into a map keyed by both flat name and canonical path, then shares it on `TreeContext`. Descendants read it with `useTreeMap()`: the router resolves a URL with `map.get(path)`, and cross-references (`<TreeButton>`, breadcrumbs) resolve by flat key (`"Store"`, `"Store.get"`) or canonical path (`"/schema/BooleanSchema"`) and link to the resolved element's `path`. Nested providers merge their maps, so links resolve across a combined set of trees.

**`<TreeBreadcrumbs>` renders an ancestor trail.** Given a page's `path`, it looks each ancestor prefix up in the tree map (so it needs a `<TreeProvider>` above) and renders a `<nav>` of links separated by `›` icons, with section-level block spacing (`BLOCK_CLASS`, overridable via the `space` prop). Works with any tree — the current page is omitted (the page title already names it).

**Mappings — override any renderer.** Each dispatch layer is backed by a `[Mapping, Mapper]` pair created by `createMapper()`. Wrap any subtree with a `*Mapping` component to swap the renderer for a specific element type without touching anything else.

| Exported pair | Element types covered | What it overrides |
|---|---|---|
| `TreePageMapping` / `TreePageMapper` | `tree-element`, `tree-documentation` | Full-page renderer |
| `TreeMenuMapping` / `TreeMenuMapper` | `tree-element`, `tree-documentation` | Sidebar menu item |
| `TreeCardMapping` / `TreeCardMapper` | `tree-element`, `tree-documentation` | Card in a listing |

## Basic usage

```tsx
import { TreeApp } from "shelving/ui";

// tree is a TreeElement returned by DirectoryExtractor.
<TreeApp tree={tree} />
```

That single line produces a complete documentation site.

## Adding custom routes

Pass extra routes to `<TreeApp>`. They are merged before the tree routes, so they take precedence on conflicts.

```tsx
<TreeApp tree={tree} routes={{ "/changelog": ChangelogPage }} />
```

## Overriding a renderer

Wrap the app (or any subtree) with a `*Mapping` component to replace the renderer for one element type.

```tsx
import { TreeApp, TreePageMapping } from "shelving/ui";

<TreePageMapping mapping={{ "tree-element": MyTreePage }}>
  <TreeApp tree={tree} />
</TreePageMapping>
```

The same pattern works for `TreeMenuMapping` (sidebar items) and `TreeCardMapping` (cards inside directory listings).

## Using menu and sidebar components directly

For finer layout control, use `<TreeSidebar>` or `<TreeMenu>` outside `<TreeApp>`.

```tsx
import { TreeMenu, TreeSidebar } from "shelving/ui";

// A home link + children menu combined — the default sidebar.
<TreeSidebar tree={root} />

// Just the navigation menu from a subtree's children.
<TreeMenu tree={section} path="/docs" />
```

## See also

- [extract](/extract) — builds the `TreeElement` tree that `<TreeApp>` consumes
- [ui/docs](/ui/docs) — the default page and card renderers dispatched by the mappers
- [ui/router](/ui/router) — `<Navigation>` and `<Router>` wired inside `<TreeApp>`
