# Equality checks

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

isInArray(["x", "y", "z"], "y");   // true  — is "y" in the array?
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
