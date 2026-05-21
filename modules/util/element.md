# Element trees

These types and helpers describe a **tree of elements** — a React-compatible structure used to represent a documentation site's content hierarchy. The [extract](/extract) module builds trees of `TreeElement` nodes from source files; the [ui/tree](/ui/tree) component renders them.

**Things to know:**

- `Element` is intentionally compatible with `React.ReactElement`. Its JSX intrinsics (`tree-directory`, `tree-file`, `tree-documentation`) are declared here so TSX files get type-checked props.
- `walkElements` flattens **iterable nesting** only — it does NOT descend into `props.children` automatically. Use `resolveElementPath` or recursive iteration when you need to walk deeper.
- `TreeElement` requires a non-null `key` (a slug string) and a `type` starting with `"tree-"`. Plain `Element` values can have `key: null`.
- `resolveElementPath` treats the root element as a container: its own `name` is never matched.

## Usage

### Walking and filtering elements

```ts
import { walkElements, filterElements, queryElements } from "shelving/util";

// Flatten any Elements shape to a flat iterable.
for (const el of walkElements(someElements)) {
  console.log(el.type, el.key);
}

// Filter by type.
const files = Array.from(filterElements(root, el => el.type === "tree-file"));

// Use query syntax for richer filtering, sorting, and limiting.
const docs = Array.from(queryElements(root, { type: "tree-documentation" }));
```

### Resolving a path inside a tree

```ts
import { resolveElementPath, getElementPaths } from "shelving/util";

// Walk to a specific descendant by name segments.
const el = resolveElementPath(root, ["util", "array"]);
// el.props.name === "array", or undefined if the path doesn't exist.

// Enumerate all paths in the tree (up to a given depth).
for (const path of getElementPaths(root, 2)) {
  console.log(path); // e.g. [], ["util"], ["util", "array"]
}
```

### Extracting text and merging elements

```ts
import { getElementText, mergeElements, isElement, isElements } from "shelving/util";

getElementText(<span>Hello <strong>world</strong></span>); // "Hello world"

const combined = mergeElements(headerElements, bodyElements);
// Returns [headerElements, bodyElements] when both are set; returns whichever is non-nullish when one is absent.
```

### Working with `DocumentationElement` props

```ts
import type { DocumentationElement, DocumentationElementProps } from "shelving/util";

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

- [extract](/extract) — builds `TreeElement` trees from TypeScript and Markdown source files.
- [ui/tree](/ui/tree) — renders `TreeElement` trees in the documentation UI.
- [util](/util) — full util module overview.
