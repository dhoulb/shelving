# Map helpers

Type definitions and helper functions for working with `Map` instances. Covers type guards, conversions from plain objects or iterables, mutable set/remove operations, and safe key lookups.

**Things to know:**

- `ImmutableMap` is a `ReadonlyMap` alias; `MutableMap` is the standard `Map`.
- `getMap()` passes an existing `Map` through unchanged — it never copies unnecessarily.
- `limitMap()` also returns the original map if `limit >= map.size`.
- Mutable helpers (`setMapItem()`, `setMapItems()`, `removeMapItems()`) mutate by reference.

## Usage

### Type guards and conversion

```ts
import { isMap, assertMap, getMap } from "shelving/util";

isMap(new Map());           // true
isMap({});                  // false

// Convert a plain object or iterable of entries to a Map.
const m = getMap({ a: 1, b: 2 });
// Map { "a" => 1, "b" => 2 }

getMap(m); // same reference — no copy
```

### Reading items

```ts
import { getMapItem, requireMapItem, isMapItem, assertMapItem } from "shelving/util";

const scores = new Map([["alice", 42], ["bob", 7]]);

getMapItem(scores, "alice");    // 42
getMapItem(scores, "carol");    // undefined

requireMapItem(scores, "alice");  // 42
requireMapItem(scores, "carol");  // throws RequiredError

isMapItem(scores, "bob");       // true
```

### Mutating maps

```ts
import { setMapItem, setMapItems, removeMapItems } from "shelving/util";

const m: Map<string, number> = new Map();

setMapItem(m, "x", 10);                           // sets "x" → 10, returns 10
setMapItems(m, [["y", 20], ["z", 30]]);            // bulk set
removeMapItems(m, "x", "y");                       // removes "x" and "y"
```

### Limiting size

```ts
import { limitMap } from "shelving/util";

const limited = limitMap(bigMap, 100); // at most 100 entries
```
