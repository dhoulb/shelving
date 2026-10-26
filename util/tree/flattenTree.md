# flattenTree()

- Kind: function
- Import: `import { flattenTree } from "shelving/util/tree";`

Flatten a tree into a `Map` for O(1) lookup, stamping a canonical `path` onto every element as it walks.
- Returns a *copy* of the tree, indexed. Each element is rebuilt with its canonical site-root-relative `path`: the root is `/`, each descendant is `parentPath + "/" + name` — so a module `schema` → `/schema`, its class `BooleanSchema` → `/schema/BooleanSchema`, its member `validate` → `/schema/BooleanSchema/validate`. A composite module name (e.g. `"util/string"`) becomes its own multi-segment chunk.
- Every element is registered under two keys, both pointing at the (stamped) element:
  - its **flat key** — bare `name` (e.g. `"BooleanSchema"`), or qualified `"Class.member"` for members (e.g. `"BooleanSchema.validate"`). This is what cross-refs (`extends` / `implements`) and README links resolve through.
  - its **canonical path** (`element.props.path`, e.g. `"/schema/BooleanSchema"`) — what the router resolves a URL to.
- The map values keep their (stamped) children, so the map doubles as the navigable tree: `map.get("/")` is the stamped root and flattening never throws away the hierarchy. The router resolves a URL with `map.get(path)`; the static builder enumerates pages from the path-shaped keys.
- Each stamped element's own `key` is also set to its canonical `path` — so a flat (cross-tree) listing of stamped elements has globally-unique React keys, where the bare `name` would collide (many `get` / `value` / `url`).
- Exported names are unique across the package (barrel re-exports enforce it at compile time), so flat-key collisions are vanishingly rare; on a collision the last writer simply wins.
- Missing keys (e.g. builtins like `Serializable`) resolve to `undefined` → callers fall back to plain text.

## Signatures

```ts
flattenTree(root: TreeElement, base?: ReadonlyMap<string, TreeElement>): Map<string, TreeElement>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `root` | `TreeElement` | The root element to flatten. |
| `.key` | `string` | Read only. |
| `.type` | `` `tree-${string}` `` | Read only. |
| `base` | `ReadonlyMap<string, TreeElement>` | An existing map to merge onto (copied, not mutated). Useful to combine several trees into one lookup. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `Map<string, TreeElement>` | A new `Map` keyed by both flat key and canonical path, whose values are copies of every element stamped with its canonical `path`. |
