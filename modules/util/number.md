# Number helpers

Type guards, conversions, rounding, clamping, and arithmetic utilities for numbers. The conversion functions ([`getNumber()`](/util/number/getNumber), [`getInteger()`](/util/number/getInteger)) accept strings and `Date` instances as well as raw numbers, and always return a finite value or `undefined` — never `NaN` or `Infinity`.

**Things to know:**

- [`isNumber()`](/util/number/isNumber) and [`isInteger()`](/util/number/isInteger) accept optional `min`/`max` bounds so you can validate a range in one call.
- `getNumber` strips non-numeric characters from strings before parsing, making it tolerant of formatted input like `"$1,200.50"`.
- `-0` is normalised to `0` by both `getNumber` and `getInteger`.
- [`boundNumber()`](/util/number/boundNumber) clamps to `[min, max]`; [`wrapNumber()`](/util/number/wrapNumber) wraps around like a clock (works in both directions).
- [`roundNumber()`](/util/number/roundNumber) trims trailing zeros, unlike `num.toFixed()`.

## Usage

### Type guards and conversion

```ts
import { isNumber, isInteger, getNumber, getInteger, requireNumber, requireInteger } from "shelving/util";

isNumber(42);           // true
isNumber(NaN);          // false
isNumber(5, 1, 10);     // true  (within range)
isNumber(0, 1, 10);     // false (below min)

getNumber("$1,200.50"); // 1200.5  (non-numeric chars stripped)
getNumber("hello");     // undefined
getNumber(new Date(0)); // 0  (milliseconds)

requireNumber("42", 0, 100); // 42
requireInteger("7");         // 7
```

### Rounding and truncation

```ts
import { roundNumber, truncateNumber, roundStep } from "shelving/util";

roundNumber(3.14159, 2);  // 3.14
truncateNumber(3.99, 1);  // 3.9
roundStep(17, 5);         // 15  (nearest multiple of 5)
```

### Clamping and wrapping

```ts
import { boundNumber, wrapNumber, isBetween } from "shelving/util";

boundNumber(12, 2, 8);  // 8   (clamped to max)
wrapNumber(12, 2, 8);   // 6   (wraps around)
wrapNumber(-2, 2, 8);   // 4   (wraps in reverse)

isBetween(5, 1, 10);    // true
```

### Utilities

```ts
import { getPercent, sumNumbers, getClosestNumber } from "shelving/util";

getPercent(25, 200);              // 12.5  (25 is 12.5% of 200)
sumNumbers([1, 2, 3, 4]);         // 10
getClosestNumber([1, 5, 10], 4);  // 5
```
