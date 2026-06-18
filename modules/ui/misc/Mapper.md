# createMapper

Creates a `[Mapping, Mapper]` component pair backed by a private React context. `Mapper` walks a pre-walked element tree and replaces each matching element type with the registered component; `Mapping` lets a subtree override or extend the dispatch table. This is the right tool when a component renders a tree of typed elements and callers need to swap in their own renderers for specific types.

**Things to know:**

- Each call to `createMapper()` creates its own context — independent mappers don't interfere with each other.
- Unmapped element types fall through and render as themselves (e.g. an unmapped `<tree-foo>` appears as a raw `<tree-foo>` element).
- Any extra props passed to `Mapper` (the type parameter `E`) are spread onto every dispatched child, so you can thread shared context like a `path` into each renderer.

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

```tsx
// With extra props threaded into every dispatched child.
const [TreeMenuMapping, TreeMenuMapper] = createMapper<{ path?: AbsolutePath }>({
  "tree-element": TreeMenuItem,
});

<TreeMenuMapper path="/foo">{queryElements(children, query)}</TreeMenuMapper>
```

## See also

- [`shelving/ui`](/ui) — the component library these element trees are rendered with.
