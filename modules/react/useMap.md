# useMap

Create a mutable `Map` that persists for the lifetime of the component. The same `Map` instance is returned on every render, so it is safe to read from and write to across renders without triggering reconstruction.

`useMap` does **not** re-render the component when the map is mutated — it is a stable scratch container, not reactive state. Use it for caches, lookup tables, or per-key bookkeeping that lives alongside a component.

## Usage

```tsx
import { useMap } from "shelving/react";

function Gallery({ ids }: { ids: string[] }) {
  const seen = useMap<string, boolean>(); // Same Map on every render.
  return <>{ids.map(id => {
    const isNew = !seen.has(id);
    seen.set(id, true);
    return <Thumbnail key={id} id={id} highlight={isNew} />;
  })}</>;
}
```

## See also

- [`useInstance()`](/react/useInstance) — a stable instance of any class, rebuilt when its arguments change.
- [`shelving/react`](/react) — overview of all React hooks and context helpers.
