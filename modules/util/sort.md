# Sorting

A quicksort implementation and type-aware comparators that handle mixed-type values gracefully. Used internally by [`shelving/util/query`](/util/query) when applying `$order` to items.

**Things to know:**

- [`compareAscending()`](/util/sort/compareAscending) defines a stable cross-type ranking: numbers → strings → `true` → `false` → `null` → other objects → `undefined`. Strings are compared locale-aware.
- [`sortArray()`](/util/sort/sortArray) returns the **same reference** when the array is already in order (no copy made). This makes it safe in memoised or reactive contexts.
- When given a non-array `Iterable`, `sortArray()` always materialises a new array.
- The [`Compare<T, A>`](/util/sort/Compare) type accepts extra trailing arguments (forwarded by `sortArray`), enabling comparators that carry additional context without closures.

## Usage

### Sorting with the default comparator

```ts
import { sortArray } from "shelving/util";

sortArray([3, 1, 2]);              // [1, 2, 3]
sortArray(["banana", "apple"]);    // ["apple", "banana"]
sortArray([true, null, 1, "a"]);   // [1, "a", true, null]  (cross-type order)

// Iterable input is materialised to an array
sortArray(new Set([3, 1, 2]));     // [1, 2, 3]
```

### Sorting descending

```ts
import { sortArray, compareDescending } from "shelving/util";

sortArray([1, 3, 2], compareDescending);  // [3, 2, 1]
```

### Custom comparator with extra arguments

```ts
import { sortArray } from "shelving/util";
import type { Compare } from "shelving/util";

type Item = { name: string; score: number };

const byField: Compare<Item, [keyof Item]> = (a, b, field) =>
  String(a[field]).localeCompare(String(b[field]));

sortArray(items, byField, "score");
sortArray(items, byField, "name");
```

### Comparing individual values

```ts
import { compareAscending, compareDescending } from "shelving/util";

compareAscending(1, 2);      // negative  (1 comes before 2)
compareAscending("b", "a");  // positive  ("b" comes after "a")
compareAscending(1, 1);      // 0
compareDescending(1, 2);     // positive  (reversed)
```
