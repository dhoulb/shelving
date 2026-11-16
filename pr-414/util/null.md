# shelving/util/null

- Kind: module
- Import: `import { … } from "shelving/util/null";`

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


## Functions

- [getNull()](null/getNull.md): Function that always returns null.
- [isNull()](null/isNull.md): Is a value null?
- [assertNull()](null/assertNull.md): Assert that a value is null.
- [notNull()](null/notNull.md): Is a value not null?
- [assertNotNull()](null/assertNotNull.md): Assert that a value is not null.
- [requireNotNull()](null/requireNotNull.md): Get the not-null version of a value, or throw RequiredError if it is null.
- [isNullish()](null/isNullish.md): Is a value nullish (null or undefined)?
- [assertNullish()](null/assertNullish.md): Assert that a value is nullish (null or undefined).
- [notNullish()](null/notNullish.md): Is a value not nullish (not null and not undefined)?
- [assertNotNullish()](null/assertNotNullish.md): Assert that a value is not nullish (not null and not undefined).
- [requireNotNullish()](null/requireNotNullish.md): Get the not-nullish version of a value, or throw RequiredError if it is null or undefined.

## Types

- [Nullable](null/Nullable.md): Nullable is the value or null.
- [Nullish](null/Nullish.md): Nullish is the value or null or undefined.
