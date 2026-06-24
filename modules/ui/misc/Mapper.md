# createMapper

Creates a `[Mapping, Mapper]` component pair backed by a private React context. `Mapper` walks a pre-walked element tree and replaces each matching element type with the registered component; `Mapping` lets a subtree override or extend the dispatch table. This is the right tool when a component renders a tree of typed elements and callers need to swap in their own renderers for specific types.

**Things to know:**

- Each call to `createMapper()` creates its own context — independent mappers don't interfere with each other.
- Unmapped element types fall through and render as themselves (e.g. an unmapped `<tree-foo>` appears as a raw `<tree-foo>` element).
- Each dispatched child is rendered with its own `props` only — the mapper threads no extra props, so any context a renderer needs (URL paths, etc.) must already live on the element (e.g. the canonical `path` stamped by `flattenTree()`).

## Usage

```tsx
import { createMapper } from "shelving/ui";

const [TreeMapping, TreeMapper] = createMapper({
  "tree-element": TreeRow,
});

// In a consumer — dispatch a pre-walked element tree.
<TreeMapper>{walkElements(children)}</TreeMapper>

// Override one entry inside a subtree.
<TreeMapping mapping={{ "tree-element": SpecialTreeRow }}>
  <TreeMapper>{walkElements(children)}</TreeMapper>
</TreeMapping>
```
