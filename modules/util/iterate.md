# Iterable helpers

General-purpose utilities for working with any `Iterable<T>` — arrays, sets, generators, and custom iterables alike. These complement the array-specific helpers by operating lazily on any sequence without forcing materialisation.

**Things to know:**

- Most helpers are generators and return `Iterable<T>`, not arrays. Wrap with `Array.from()` when you need an array.
- `flattenItems` recurses into any depth of nested iterables, not just one level.
- `getRange` yields in descending order automatically when `end < start`.
- `reduceItems` returns `undefined` if the iterable is empty and no `initial` value is supplied.

## Usage

### Checking and counting

```ts
import { isIterable, hasItems, countItems } from "shelving/util";

isIterable([1, 2, 3]);      // true
isIterable(new Set());      // true
isIterable("hello");        // false (strings are not iterable here)

hasItems([]);               // false
hasItems(new Set([1]));     // true

countItems(new Set([1, 2, 3])); // 3
```

### Slicing, picking, and chunking

```ts
import { limitItems, pickItems, omitItems, getChunks } from "shelving/util";

Array.from(limitItems([1, 2, 3, 4, 5], 3));     // [1, 2, 3]
Array.from(pickItems([1, 2, 3, 4], 2, 4));       // [2, 4]
Array.from(omitItems([1, 2, 3, 4], 2, 4));       // [1, 3]
Array.from(getChunks([1, 2, 3, 4, 5], 2));       // [[1, 2], [3, 4], [5]]
```

### Ranges and merging

```ts
import { getRange, mergeItems, interleaveItems, flattenItems } from "shelving/util";

Array.from(getRange(1, 5));   // [1, 2, 3, 4, 5]
Array.from(getRange(5, 1));   // [5, 4, 3, 2, 1]

Array.from(mergeItems([1, 2], [3, 4])); // [1, 2, 3, 4]

Array.from(interleaveItems(["a", "b", "c"], ", ")); // ["a", ", ", "b", ", ", "c"]

Array.from(flattenItems([1, [2, [3, 4]], 5])); // [1, 2, 3, 4, 5]
```

### Reducing

```ts
import { reduceItems } from "shelving/util";

reduceItems([1, 2, 3, 4], (acc, n) => acc + n, 0); // 10
```

## See also

- [util](/util) — array-specific helpers such as `withArrayItem`, `omitArrayItems`, and `getUniqueArray`.
