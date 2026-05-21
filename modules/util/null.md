# Null and nullish helpers

Type guards, assertions, and utility types for `null` and nullish (`null | undefined`) values. Use these instead of inline `=== null` checks to get proper TypeScript type narrowing and consistent error messages.

## Usage

```ts
import {
  isNull, notNull, assertNull, assertNotNull, requireNotNull,
  isNullish, notNullish, assertNullish, assertNotNullish, requireNotNullish,
  getNull, type Nullable, type Nullish,
} from "shelving/util";

// Null checks.
isNull(null);            // true
notNull(null);           // false
requireNotNull(null);    // throws RequiredError
requireNotNull("hi");    // "hi"

// Nullish checks (null or undefined).
isNullish(undefined);    // true
isNullish(0);            // false
notNullish(0);           // true
requireNotNullish(null); // throws RequiredError

// Filter null values from an array using notNull as a type-guard predicate.
const values: Array<string | null> = ["a", null, "b"];
values.filter(notNull); // string[]

// getNull is useful as a no-op factory.
const fallback = getNull; // () => null
```

## See also

- [util](/util) — full util module overview.
