# Element trees

These types and helpers describe a **tree of elements** — a hierarchical structure built on top of [`Element`](/util/element), used to represent a documentation site's content hierarchy. The [extract](/extract) module builds trees of `TreeElement` nodes from source files; the [ui/tree](/ui/tree) component renders them.

**Things to know:**

- `TreeElement` requires a non-null `key` (a slug string) and a `type` starting with `"tree-"`. Plain `Element` values can have `key: null`.
- The JSX intrinsics (`tree-element`, `tree-documentation`) are declared here so TSX files get type-checked props.
- `resolveTreePath` treats the root element as a container: its own `name` is never matched. A child `name` may contain `/` (e.g. a module `"util/string"`), in which case it spans multiple path segments.
- `resolveTreePath` / `getTreePaths` work in raw `string[]` segments — join them however the caller needs. For a stamped canonical URL string, read `element.props.path` instead (set by `stampTreePaths`).
- `stampTreePaths` stamps a canonical site-root-relative `path` (e.g. `"/schema/BooleanSchema"`) onto every element by joining ancestor names — the exact URL it renders at, and the canonical key it's flattened under.

## Usage

### Resolving a path inside a tree

```ts
import { resolveTreePath, getTreePaths } from "shelving/util";

// Walk to a specific descendant by name segments.
const el = resolveTreePath(root, ["util", "array"]);
// el.props.name === "array", or undefined if the path doesn't exist.

// Enumerate all paths in the tree (up to a given depth).
for (const path of getTreePaths(root, 2)) {
  console.log(path); // e.g. [], ["util"], ["util", "array"]
}
```

### Flattening a tree for fast lookup

```ts
import { flattenTree, stampTreePaths } from "shelving/util";

// Stamp canonical `path`s first, then flatten — each element is keyed by both forms.
const map = flattenTree(stampTreePaths(root));
map.get("Store");                  // the `Store` element (flat key)
map.get("Store.get");              // the `Store.get` member (qualified `Class.member` key)
map.get("/store/Store");           // the same `Store` element (canonical path key)
map.get("Store")?.props.path;      // "/store/Store"

// Merge several trees into one lookup (later writers win on key collisions).
const merged = flattenTree(stampTreePaths(otherRoot), map);
```

### Working with `DocumentationElement` props

```ts
import type { DocumentationElement } from "shelving/util";

// A tree-documentation element carries structured API docs.
const el: DocumentationElement = {
  type: "tree-documentation",
  key: "getFirst",
  props: {
    name: "getFirst",
    kind: "function",
    signatures: ["getFirst<T>(arr: T[]): T | undefined"],
    params: [{ name: "arr", type: "T[]" }],
    returns: [{ type: "T | undefined" }],
  },
};
```

## See also

- [element](/util/element) — the generic `Element` type and walk/filter helpers this builds on.
- [extract](/extract) — builds `TreeElement` trees from TypeScript and Markdown source files.
- [ui/tree](/ui/tree) — renders `TreeElement` trees in the documentation UI.
- [util](/util) — full util module overview.
