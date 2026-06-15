# TreeSidebar

The default sidebar for a tree-based site: a single "home" link for the root element, followed by the root's children as a navigation menu. [`TreeApp`](/ui/TreeApp) mounts one of these automatically.

**Things to know:**

- The home link uses `path` as its href (defaulting to `/`); children's hrefs are computed by appending their `name` to the root path.
- The children render through the same mapper as [`TreeMenu`](/ui/TreeMenu), so customise them by wrapping in `<TreeMenuMapping mapping={…}>`.
- Only directories, files, and `kind: "module"` symbols appear — code symbols are kept off the navigation.
- Use it directly for finer layout control outside [`TreeApp`](/ui/TreeApp).

## Usage

```tsx
import { TreeSidebar } from "shelving/ui";

// A home link + children menu combined — the default sidebar.
<TreeSidebar tree={root} />
```

## See also

- [`TreeMenu`](/ui/TreeMenu) — the children menu, usable on its own; shares the override mapper.
- [`TreeApp`](/ui/TreeApp) — wires this sidebar into the page layout.
