# Filter helpers

Lightweight generic filter utilities for synchronous iterables, arrays, and async sequences. They exist to avoid having to repeat the `for…of / if match / yield` pattern everywhere a match function is used as a predicate.

**Things to know:**

- [`filterArray()`](/util/filter/filterArray) returns the **same reference** when every item passes the predicate — no allocation if nothing is removed. This keeps it safe to use in memoised contexts.
- [`filterItems()`](/util/filter/filterItems) is a generator — it yields lazily and works with any `Iterable<T>`, not just arrays.
- [`filterSequence()`](/util/filter/filterSequence) is the async counterpart for `AsyncIterable<T>` streams.
- Extra arguments (`...args`) are forwarded to the `match` function after the item, avoiding closure allocation in tight loops.

## Usage

```ts
import { filterItems, filterArray, filterSequence } from "shelving/util";
import { isString } from "shelving/util";

// Lazy iterable filter.
const strings = Array.from(filterItems(["a", 1, "b", 2], isString));
// ["a", "b"]

// Immutable array filter — same ref when nothing changes.
const arr = ["a", "b", "c"];
const filtered = filterArray(arr, (s) => s !== "b"); // ["a", "c"]
filterArray(arr, () => true) === arr;                 // true  (same reference)

// Async stream filter.
async function* source() { yield 1; yield 2; yield 3; }
for await (const n of filterSequence(source(), (n) => n > 1)) {
  console.log(n); // 2, 3
}
```

### Using extra arguments

```ts
import { filterItems } from "shelving/util";
import { isInArray } from "shelving/util";

const allowed = ["a", "c"];
const result = Array.from(filterItems(["a", "b", "c", "d"], isInArray, allowed));
// ["a", "c"]
```

## See also

- [util](/util) — full util module overview, including the [`Match`](/util/filter/Match) type.
