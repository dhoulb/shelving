# Numeric and symbolic constants

Named constants for common numeric magnitudes, time durations, whitespace characters, and control symbols. Import these instead of magic numbers to keep code readable and consistent.

- Time constants ([`SECOND`](/util/constants/SECOND), [`MINUTE`](/util/constants/MINUTE), [`HOUR`](/util/constants/HOUR), [`DAY`](/util/constants/DAY), [`WEEK`](/util/constants/WEEK), [`MONTH`](/util/constants/MONTH), [`YEAR`](/util/constants/YEAR)) are in **milliseconds**, matching the `Date` API.
- `MONTH` is 30 days and `YEAR` is 365 days — fixed approximations, not calendar-aware.
- The three special symbols ([`ABORT`](/util/constants/ABORT), [`NONE`](/util/constants/NONE), [`SKIP`](/util/constants/SKIP)) are unique symbols, safe to use as sentinel values in union types.

## Usage

### Time durations

```ts
import { SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, YEAR } from "shelving/util";

const cache = new Map();
setTimeout(() => cache.clear(), 5 * MINUTE);

const expiresAt = Date.now() + 30 * DAY;
```

### Numeric magnitudes

```ts
import { THOUSAND, TEN_THOUSAND, HUNDRED_THOUSAND, MILLION, BILLION, TRILLION } from "shelving/util";

const limit = 2 * MILLION;
```

### Whitespace characters

```ts
import { NBSP, THINSP, NNBSP } from "shelving/util";

// Non-breaking space — prevents line breaks between words
const label = `100${NBSP}km`;

// Narrow non-breaking space — conventional between a number and its unit
const formatted = `42${NNBSP}°C`;
```

### Control symbols

```ts
import { ABORT, NONE, SKIP } from "shelving/util";

function process(value: unknown): string | typeof ABORT {
  if (cancelled) return ABORT;
  return String(value);
}
```

### Status icons

```ts
import { WAITING, SUCCESS, FAILURE, UP, DOWN, LEFT, RIGHT } from "shelving/util";

console.log(`${SUCCESS} Done`);
console.log(`${FAILURE} Failed`);
```

## See also

- [util](/util) — full util module overview
- [`shelving/util/date`](/util/date) — date helpers that use [`DAY`](/util/constants/DAY), [`WEEK`](/util/constants/WEEK), etc. conceptually
