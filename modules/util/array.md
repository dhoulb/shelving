# Array helpers

Typed helpers for reading, validating, and immutably transforming arrays. All immutable operations return the original reference when nothing changed, which keeps React state and memoisation stable.

- `with*` / `omit*` / `toggle*` functions accept any [`PossibleArray`](/util/array/PossibleArray) (an array or any `Iterable`) but always return a typed [`ImmutableArray`](/util/array/ImmutableArray).
- `add*` / `delete*` functions mutate the array in place — use them only when you own the reference.
- [`withArrayItem()`](/util/array/withArrayItem) / [`withArrayItems()`](/util/array/withArrayItems) are set-semantics: they skip items already present rather than creating duplicates.

## Usage

### Checking and asserting

```ts
import { isArray, assertArray, requireArray } from "shelving/util";

isArray(value);           // true if Array
isArray(value, 1);        // true if Array with at least 1 item
isArray(value, 2, 5);     // true if Array with 2–5 items

assertArray(value, 1);    // throws RequiredError if empty or not an array
requireArray(iterable, 1); // converts iterable then asserts, returns ImmutableArray
```

### Reading items

```ts
import { getFirst, requireFirst, getLast, requireLast, getNext, getPrev } from "shelving/util";

getFirst([10, 20, 30]);          // 10
requireFirst([]);                // throws RequiredError
getLast([10, 20, 30]);           // 30
getNext([1, 2, 3], 2);           // 3
getPrev([1, 2, 3], 2);           // 1
```

### Immutable updates

```ts
import { withArrayItem, withArrayItems, omitArrayItem, omitArrayItems,
         toggleArrayItem, withArrayIndex, omitArrayIndex } from "shelving/util";

withArrayItem(["a", "b"], "c");          // ["a", "b", "c"]
withArrayItem(["a", "b"], "b");          // same ref — already present
omitArrayItem(["a", "b", "c"], "b");     // ["a", "c"]
toggleArrayItem(["a", "b"], "b");        // ["a"]
toggleArrayItem(["a", "b"], "c");        // ["a", "b", "c"]
withArrayIndex([10, 20, 30], 1, 99);     // [10, 99, 30]
omitArrayIndex([10, 20, 30], 1);         // [10, 30]
```

### Mutable updates (by reference)

```ts
import { addArrayItem, addArrayItems, deleteArrayItem, deleteArrayItems } from "shelving/util";

const arr = ["a", "b"];
addArrayItem(arr, "c");      // arr is now ["a", "b", "c"]; returns "c"
addArrayItem(arr, "b");      // no-op — already present
deleteArrayItem(arr, "a");   // arr is now ["b", "c"]
```

### Filtering and shaping

```ts
import { getUniqueArray, limitArray, interleaveArray,
         pickArrayItems, shuffleArray } from "shelving/util";

getUniqueArray([1, 2, 2, 3]);           // [1, 2, 3]
limitArray([1, 2, 3, 4, 5], 3);         // [1, 2, 3]
interleaveArray(["a", "b", "c"], ", "); // ["a", ", ", "b", ", ", "c"]
pickArrayItems([1, 2, 3, 4], 2, 4);     // [2, 4]
shuffleArray([1, 2, 3]);                // randomised copy
```

### Membership checks

```ts
import { isArrayItem, assertArrayItem } from "shelving/util";

isArrayItem(["x", "y"], "x");    // true
assertArrayItem(["x", "y"], "z"); // throws RequiredError
```

## See also

- [util](/util)
