# Set helpers

Typed helpers for working with JavaScript `Set` objects. Covers type guards, conversion, membership checks, and mutable add/delete operations.

**Things to know:**

- [`ImmutableSet<T>`](/util/set/ImmutableSet) is an alias for `ReadonlySet<T>`; [`MutableSet<T>`](/util/set/MutableSet) is `Set<T>`. Use immutable types in function signatures where you don't need to mutate.
- [`addSetItem()`](/util/set/addSetItem) mutates the set in place and returns the item — handy for chaining or registering items by reference.
- [`limitSet()`](/util/set/limitSet) returns the original set reference unchanged when the limit is greater than or equal to the set size.

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
