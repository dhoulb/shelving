# shelving/util/set

- Kind: module
- Import: `import { … } from "shelving/util/set";`

Typed helpers for working with JavaScript `Set` objects. Covers type guards, conversion, membership checks, and mutable add/delete operations.

**Things to know:**

- `ImmutableSet<T>` is an alias for `ReadonlySet<T>`; `MutableSet<T>` is `Set<T>`. Use immutable types in function signatures where you don't need to mutate.
- `addSetItem()` mutates the set in place and returns the item — handy for chaining or registering items by reference.
- `limitSet()` returns the original set reference unchanged when the limit is greater than or equal to the set size.

## Usage

### Type guards and conversion

```ts
import { isSet, assertSet, getSet } from "shelving/util";

isSet(new Set([1, 2]));  // true
isSet([1, 2]);           // false
assertSet("oops");       // throws RequiredError

getSet([1, 2, 2, 3]);    // Set { 1, 2, 3 }  (deduplicates)
getSet(new Set([1, 2])); // same reference returned
```

### Membership checks

```ts
import { isSetItem, assertSetItem } from "shelving/util";

const roles = new Set(["admin", "editor"]);

isSetItem(roles, "admin");   // true
isSetItem(roles, "guest");   // false
assertSetItem(roles, "guest"); // throws RequiredError
```

### Mutating a set

```ts
import { addSetItem, addSetItems, deleteSetItems } from "shelving/util";

const s: Set<string> = new Set();

addSetItem(s, "a");           // adds "a", returns "a"
addSetItems(s, "b", "c");     // adds "b" and "c"
deleteSetItems(s, "a", "b");  // removes "a" and "b"
```

### Limiting a set

```ts
import { limitSet } from "shelving/util";

const s = new Set([1, 2, 3, 4, 5]);
limitSet(s, 3);  // Set { 1, 2, 3 }
limitSet(s, 10); // same Set reference (no copy needed)
```


## Functions

- [isSet()](set/isSet.md): Is an unknown value a set?
- [assertSet()](set/assertSet.md): Assert that a value is a Set instance.
- [getSet()](set/getSet.md): Convert a possible set to a Set.
- [limitSet()](set/limitSet.md): Apply a limit to a set.
- [isSetItem()](set/isSetItem.md): Is an unknown value an item in a set?
- [assertSetItem()](set/assertSetItem.md): Assert that an unknown value is an item in a set.
- [addSetItem()](set/addSetItem.md): Add an item to a set (by reference) and return the set item.
- [addSetItems()](set/addSetItems.md): Add multiple items to a set (by reference).
- [deleteSetItems()](set/deleteSetItems.md): Remove multiple items from a set (by reference).

## Types

- [ImmutableSet](set/ImmutableSet.md): Set that cannot be changed.
- [MutableSet](set/MutableSet.md): Set that can be changed.
- [PossibleSet](set/PossibleSet.md): Things that can be converted to sets.
- [SetItem](set/SetItem.md): Get the type of the items in a set.
