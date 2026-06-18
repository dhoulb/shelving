# Deep diff helpers

Compute the minimal transformation needed to turn one value into another. Used internally by the update and sync layers to avoid sending unchanged data. Returns the special [`SAME`](/util/diff/SAME) symbol when the two values are deeply equal.

- Arrays are compared as a unit — if they differ at all, the full new array is returned (no item-level patching).
- Objects are compared recursively. Keys present in `left` but absent from `right` appear in the diff as `undefined` (indicating deletion).
- Scalar values that differ always return `right` directly — they cannot be partially diffed.
- Objects with different constructors are never merged; `right` is returned as-is.

## Usage

### Basic diff

```ts
import { deepDiff, SAME } from "shelving/util";

deepDiff(1, 1);               // SAME
deepDiff("a", "b");           // "b"
deepDiff([1, 2], [1, 2]);     // SAME
deepDiff([1, 2], [1, 3]);     // [1, 3]  (full array)
```

### Object diff

```ts
import { deepDiff, deepDiffObject, SAME } from "shelving/util";

const left  = { a: 1, b: 2, c: 3 };
const right = { a: 1, b: 99 };

deepDiff(left, right);
// { b: 99, c: undefined }  — b changed, c deleted

deepDiff(left, left); // SAME
```

### Array diff

```ts
import { deepDiffArray, SAME } from "shelving/util";

deepDiffArray([1, 2, 3], [1, 2, 3]); // SAME
deepDiffArray([1, 2], [1, 3]);        // [1, 3]
```

### Checking for changes

```ts
import { deepDiff, SAME } from "shelving/util";

const diff = deepDiff(previous, next);
if (diff !== SAME) applyUpdate(diff);
```

## See also

- [util](/util) — full util module overview
- [`shelving/util/data`](/util/data) — [`Data`](/util/data/Data) type used with object diffs
