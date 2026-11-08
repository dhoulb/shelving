# shelving/util/iterate

- Kind: module
- Import: `import { … } from "shelving/util/iterate";`

General-purpose utilities for working with any `Iterable<T>` — arrays, sets, generators, and custom iterables alike. These complement the array-specific helpers by operating lazily on any sequence without forcing materialisation.

**Things to know:**

- Most helpers are generators and return `Iterable<T>`, not arrays. Wrap with `Array.from()` when you need an array.
- `flattenItems()` recurses into any depth of nested iterables, not just one level.
- `getRange()` yields in descending order automatically when `end < start`.
- `reduceItems()` returns `undefined` if the iterable is empty and no `initial` value is supplied.

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


## Functions

- [isIterable()](iterate/isIterable.md): Is an unknown value an iterable?
- [flattenItems()](iterate/flattenItems.md): Flatten one or more (possibly nested) iterables into a flat sequence of items.
- [hasItems()](iterate/hasItems.md): Does an iterable have one or more items.
- [countItems()](iterate/countItems.md): Count the number of items in an iterable.
- [getRange()](iterate/getRange.md): Yield a range of numbers from start to end
- [limitItems()](iterate/limitItems.md): Apply a limit to an iterable set of items.
- [pickItems()](iterate/pickItems.md): Pick items from an iterable set of items.
- [omitItems()](iterate/omitItems.md): Omit items from an iterable set of items.
- [reduceItems()](iterate/reduceItems.md): Reduce an iterable set of items using a reducer function.
- [getChunks()](iterate/getChunks.md): Yield chunks of a given size.
- [mergeItems()](iterate/mergeItems.md): Merge two or more iterables into a single iterable set.
- [interleaveItems()](iterate/interleaveItems.md): Interleave items with a separator, i.e. [item1, separator, item2, separator, item3]

## Types

- [DeepIterable](iterate/DeepIterable.md): An iterable containing items or nested iterables of items.
