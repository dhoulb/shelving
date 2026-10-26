# shelving/util/equal

- Kind: module
- Import: `import { … } from "shelving/util/equal";`

Strict and structural equality predicates used throughout the library. The three tiers — exact, shallow, and deep — map to the same `left is T` type-guard pattern so they can be used interchangeably anywhere a `Match` function is expected.

**Things to know:**

- `isEqual()` is a typed wrapper around `===` — it serves as a type guard, narrowing `left` to `T` on `true`.
- `isShallowEqual()` compares one level deep: array items and object props are compared with `isEqual` (strict `===`).
- `isDeepEqual()` recurses into nested arrays, objects, and `Map`s.
- All structural checks short-circuit on referential equality first (`left === right`), so passing the same reference always returns `true` instantly.
- `isObjectEqual()` requires the same set of keys — no extra props allowed. Use `isObjectMatch()` for a subset check.
- `isMapEqual()` requires entries in the same **insertion order**.

## Usage

### Exact and structural equality

```ts
import { isEqual, isShallowEqual, isDeepEqual } from "shelving/util";

isEqual(1, 1);                                     // true
isEqual("a", "b");                                 // false

isShallowEqual({ a: 1 }, { a: 1 });                // true
isShallowEqual({ a: { b: 1 } }, { a: { b: 1 } }); // false (nested object not ===)

isDeepEqual({ a: { b: 1 } }, { a: { b: 1 } });    // true
isDeepEqual([1, [2, 3]], [1, [2, 3]]);             // true
```

### Object and array checks

```ts
import { isObjectEqual, isObjectMatch, isArrayEqual, isMapEqual } from "shelving/util";

isObjectEqual({ a: 1, b: 2 }, { a: 1, b: 2 });    // true (exact key match)
isObjectEqual({ a: 1, b: 2 }, { a: 1 });           // false (extra key in left)
isObjectMatch({ a: 1, b: 2 }, { a: 1 });           // true  (subset match)

isArrayEqual([1, 2, 3], [1, 2, 3]);                // true
isArrayEqual([1, 2], [1, 2, 3]);                   // false

// Pass isDeepEqual as recursor for nested structure.
isObjectEqual({ x: [1, 2] }, { x: [1, 2] }, isDeepEqual); // true
```

### Array membership

```ts
import { isInArray, isArrayWith } from "shelving/util";

isInArray("y", ["x", "y", "z"]);   // true  — is "y" in the array?
isArrayWith(["x", "y"], "x");      // true  — is the left value an array containing "x"?
```

### Comparison predicates

```ts
import { isLess, isGreater, isEqualLess, isEqualGreater } from "shelving/util";

isLess(3, 5);         // true
isGreater(5, 3);      // true
isEqualLess(5, 5);    // true
```

### Assertions

```ts
import { assertEqual, assertNot } from "shelving/util";

assertEqual(value, expectedValue); // asserts value === expectedValue, narrows type
assertNot(value, null);            // asserts value !== null, narrows type
```


## Functions

- [assertEqual](equal/assertEqual.md): Assert that two values are exactly (referentially) equal, narrowing left to the type of right.
- [assertNot](equal/assertNot.md): Assert that two values are not equal, narrowing left to exclude the type of right.
- [isEqual](equal/isEqual.md): Is unknown value left exactly (referentially) equal to right?
- [notEqual](equal/notEqual.md): Is unknown value left not exactly (referentially) equal to right?
- [isLess](equal/isLess.md): Is unknown value left less than right (using compareAscending())?
- [isEqualLess](equal/isEqualLess.md): Is unknown value left less than or equal to right (using compareAscending())?
- [isGreater](equal/isGreater.md): Is unknown value left greater than right (using compareAscending())?
- [isEqualGreater](equal/isEqualGreater.md): Is unknown value left greater than or equal to right (using compareAscending())?
- [isShallowEqual](equal/isShallowEqual.md): Are two unknown values shallowly equal?
- [notShallowEqual](equal/notShallowEqual.md): Are two unknown values not shallowly equal?
- [isDeepEqual](equal/isDeepEqual.md): Are two unknown values deeply equal?
- [notDeepEqual](equal/notDeepEqual.md): Are two unknown values not deeply equal?
- [isMapEqual](equal/isMapEqual.md): Are two maps equal based on their items?
- [isArrayEqual](equal/isArrayEqual.md): Are two arrays equal based on their items?
- [isInArray](equal/isInArray.md): Is unknown value left in array right?
- [notInArray](equal/notInArray.md): Is unknown value left not in array right?
- [isArrayWith](equal/isArrayWith.md): Is unknown value left an array that includes right?
- [notArrayWith](equal/notArrayWith.md): Is unknown value left not an array, or an array that does not include right?
- [isObjectEqual](equal/isObjectEqual.md): Are two objects equal based on their own props?
- [isObjectMatch](equal/isObjectMatch.md): Are two objects partially equal based on their own props?
- [isObjectWith](equal/isObjectWith.md): Is unknown value left an object with every prop from right?
- [notObjectWith](equal/notObjectWith.md): Is unknown value left not an object or missing one or more props from right?
