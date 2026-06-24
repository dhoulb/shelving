# TreeMenu

A sidebar navigation menu built from the children of a root tree element. Each child renders as a menu item; items with menu-eligible children of their own reveal a nested submenu based on the current URL.

**Things to know:**

- Only directories and files appear, plus documentation symbols of `kind: "module"` — functions, classes, methods, properties, etc. are kept off the navigation (they still get their own pages via `<TreeApp>`).
- Each item links straight to its element's own canonical `path` (stamped by `flattenTree()`), so feed it a flattened element — e.g. `useTreeMap().get("/")` — rather than a raw extracted tree.
- It is a `[Mapping, Mapper]` pair: wrap any subtree in `<TreeMenuMapping mapping={…}>` to swap the per-type menu-item renderer without touching the rest of the site. `<TreeSidebar>` shares this same mapper.
- Use it directly for finer layout control; otherwise `<TreeApp>` wires a `<TreeSidebar>` (a home link plus this menu) for you.

## Usage

```tsx
import { TreeMenu } from "shelving/ui";
import { useTreeMap } from "shelving/ui";

// Just the navigation menu from the flattened root's children.
<TreeMenu tree={useTreeMap().get("/")} />
```

Override the menu-item renderer for one element type:

```tsx
import { TreeApp, TreeMenuMapping } from "shelving/ui";

<TreeMenuMapping mapping={{ "tree-element": MyMenuItem }}>
  <TreeApp tree={tree} />
</TreeMenuMapping>
```
