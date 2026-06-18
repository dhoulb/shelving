# Merge helpers

Immutably merge two values — objects, arrays, or primitives. All merge functions return the `left` reference unchanged when nothing actually changed, making them safe to use in memoised or reactive contexts.

**Things to know:**

- Arrays are always merged shallowly (unique items only). Deep array merge is intentionally unsupported because array indices are not stable identifiers.
- [`mergeObject()`](/util/merge/mergeObject) treats an explicit `undefined` value in `right` as a deletion of that key from the merged result.
- [`exactMerge()`](/util/merge/exactMerge) simply returns `right` — the building block for shallow merges of object properties.
- Same-reference shortcut: if `left === right`, the function returns immediately without allocating.

## Usage

### Shallow merge

```ts
import { shallowMerge } from "shelving/util";

// Objects: top-level props from right win.
shallowMerge({ a: 1, b: 2 }, { b: 99, c: 3 });
// { a: 1, b: 99, c: 3 }

// Arrays: unique items from right are appended.
shallowMerge(["a", "b"], ["b", "c"]);
// ["a", "b", "c"]

// No change → same reference returned.
const obj = { x: 1 };
shallowMerge(obj, {}) === obj; // true
```

### Deep merge

```ts
import { deepMerge } from "shelving/util";

deepMerge(
  { user: { name: "Alice", role: "viewer" } },
  { user: { role: "admin" } },
);
// { user: { name: "Alice", role: "admin" } }
```

### Merging objects and arrays directly

```ts
import { mergeObject, mergeArray } from "shelving/util";

// Use a custom recursor (e.g. deepMerge) for object merging.
mergeObject({ a: 1 }, { b: 2 }, deepMerge);  // { a: 1, b: 2 }

// Merge two arrays (unique items only).
mergeArray([1, 2, 3], [3, 4, 5]); // [1, 2, 3, 4, 5]
```

## See also

- [`shelving/util/object`](/util/object) — immutable [`withProp()`](/util/object/withProp)/[`omitProp()`](/util/object/omitProp) helpers for single-property changes.
- [util](/util) — full util module overview.
