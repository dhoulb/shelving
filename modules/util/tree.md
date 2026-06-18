# Element trees

These types and helpers describe a **tree of elements** — a hierarchical structure built on top of [`shelving/util/element`](/util/element), used to represent a documentation site's content hierarchy. The [`shelving/extract`](/extract) module builds trees of [`TreeElement`](/util/tree/TreeElement) nodes from source files; the [`shelving/ui`](/ui) component renders them.

**Things to know:**

- [`TreeElement`](/util/tree/TreeElement) requires a non-null `key` (a slug string) and a `type` starting with `"tree-"`. Plain [`Element`](/util/element/Element) values can have `key: null`.
- The JSX intrinsics (`tree-element`, `tree-documentation`) are declared here so TSX files get type-checked props.
- [`flattenTree()`](/util/tree/flattenTree) is the one transform from a raw extracted tree to the structure the UI runs on: it stamps a canonical `path` on every element and indexes them into a `Map` keyed by both flat name and canonical path.
- A child `name` may contain `/` (e.g. a module `"util/string"`), in which case it becomes its own multi-segment chunk of the canonical path.

## Usage

### Flattening a tree for lookup, routing, and rendering

```ts
import { flattenTree } from "shelving/util";

// One pass: stamps each element's canonical `path` and indexes it under both keys.
const map = flattenTree(root);

// Flat keys — what cross-references (`extends` / `overrides`) and README links resolve through.
map.get("Store");                  // the `Store` element
map.get("Store.get");              // the `Store.get` member (qualified `Class.member` key)
map.get("Store")?.props.path;      // "/store/Store" — its stamped canonical URL

// Canonical path keys — what the router resolves a URL to.
map.get("/store/Store");           // the same `Store` element
map.get("/store/Store")?.props.children; // …with its (stamped) children, so the map doubles as the tree

// Merge several trees into one lookup (later writers win on the rare key collision).
const merged = flattenTree(otherRoot, map);
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
