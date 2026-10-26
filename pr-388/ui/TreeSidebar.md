# TreeSidebar

- Kind: component
- Import: `import { TreeSidebar } from "shelving/ui";`

Sidebar built from the surrounding tree, in three sections separated by dividers.

- **Middle:** a `<TextInput>` search-as-you-type filter.
- **Bottom:** the root's children as a `<TreeMenuMapper>` — swapped for a flat ranked list of results (capped at 20) while the search holds a query.
- Both menus are `small`, so the long list of pages stays dense.

Reads the flattened tree from the surrounding `<TreeProvider>` (`useTreeMap().get("/")`), so child and result hrefs use each element's stamped canonical `path`. To customise child renderers wrap in `<TreeMenuMapping mapping={…}>` (same context as `<TreeMenu>`).

The default sidebar for a tree-based site: a "home" link, a search-as-you-type filter, and the root's children as a navigation menu — three sections separated by dividers. `<TreeApp>` mounts one of these automatically.

**Things to know:**

- Reads the flattened tree from the surrounding `<TreeProvider>` (`useTreeMap().get("/")`), so it takes no `tree` prop — mount it anywhere inside a `<TreeApp>` / `<TreeProvider>`.
- The home link points at `/`; children's hrefs use each element's stamped canonical `path`.
- The search `<TextInput>` filters the tree as you type; while a query is held it swaps the menu for a flat ranked list of results (capped at 20).
- The children render through the same mapper as `<TreeMenu>`, so customise them by wrapping in `<TreeMenuMapping mapping={…}>`.
- Only directories, files, and `kind: "module"` symbols appear — code symbols are kept off the navigation.
- Use it directly for finer layout control outside the default `<TreeApp>` sidebar.

## Usage

```tsx
import { TreeSidebar } from "shelving/ui";

// A home link + children menu combined — the default sidebar.
<TreeSidebar />
```


## Signatures

```ts
TreeSidebar({ children }: TreeSidebarProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `TreeSidebarProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |
