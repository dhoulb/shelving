# shelving/util/map

- Kind: module
- Import: `import { … } from "shelving/util/map";`

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


## Functions

- [isMap](map/isMap.md): Is an unknown value a map?
- [assertMap](map/assertMap.md): Assert that a value is a Map instance.
- [getMap](map/getMap.md): Convert an iterable to a Map (if it's already a Map it passes through unchanged).
- [limitMap](map/limitMap.md): Apply a limit to a map.
- [isMapItem](map/isMapItem.md): Is an unknown value a key for an item in a map?
- [assertMapItem](map/assertMapItem.md): Assert that an unknown value is a key for an item in a map.
- [setMapItem](map/setMapItem.md): Set an item in a map (by reference) and return the value that was set.
- [setMapItems](map/setMapItems.md): Add multiple items to a map (by reference).
- [removeMapItems](map/removeMapItems.md): Remove multiple items from a map (by reference).
- [getMapItem](map/getMapItem.md): Get an item in a map, or undefined if it doesn't exist.
- [requireMapItem](map/requireMapItem.md): Get an item in a map, or throw RequiredError if it doesn't exist.

## Types

- [ImmutableMap](map/ImmutableMap.md): Map that cannot be changed.
- [MutableMap](map/MutableMap.md): Map that can be changed.
- [MapKey](map/MapKey.md): Extract the type for the key of a map.
- [MapValue](map/MapValue.md): Extract the type for the value of a map.
- [MapItem](map/MapItem.md): Get the type for an item of a map in entry format.
- [PossibleMap](map/PossibleMap.md): Things that can be converted to maps.
- [PossibleStringMap](map/PossibleStringMap.md): Things that can be converted to maps with string keys.
