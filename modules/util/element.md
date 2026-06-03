# Elements

These types and helpers describe a **React-compatible element** structure (`type`, `props`, `key`) and the generic tools for walking, filtering, and flattening collections of them. The tree-shaped layer built on top of `Element` — `TreeElement`, path resolution, and tree flattening — lives in a sibling file; see [tree](/util/tree).

**Things to know:**

- `Element` is intentionally compatible with `React.ReactElement`. It's declared as a `type` (not an `interface`) so its implicit index signature lets it satisfy `Data` for `queryElements()`.
- `Elements` is the recursive union React calls `ReactNode` — a single element, a (possibly nested) iterable, a string, `null`, or `undefined`.
- `walkElements` flattens **iterable nesting** only — it does NOT descend into `props.children` automatically. Walking deeper is the consumer's job.

## Usage

### Walking and filtering elements

```ts
import { walkElements, filterElements, queryElements } from "shelving/util";

// Flatten any Elements shape to a flat iterable.
for (const el of walkElements(someElements)) {
  console.log(el.type, el.key);
}

// Filter by a match function.
const files = Array.from(filterElements(root, el => el.type === "tree-file"));

// Use query syntax for richer filtering, sorting, and limiting.
const docs = Array.from(queryElements(root, { type: "tree-documentation" }));
```

### Extracting text and merging elements

```ts
import { getElementText, mergeElements, isElement, isElements } from "shelving/util";

getElementText(<span>Hello <strong>world</strong></span>); // "Hello world"

const combined = mergeElements(headerElements, bodyElements);
// Returns [headerElements, bodyElements] when both are set; returns whichever is non-nullish when one is absent.
```

## See also

- [tree](/util/tree) — `TreeElement` and the path/flatten helpers built on `Element`.
- [util](/util) — full util module overview.
