# shelving/util/constants

- Kind: module
- Import: `import { … } from "shelving/util/constants";`

Named constants for common numeric magnitudes, time durations, whitespace characters, and control symbols. Import these instead of magic numbers to keep code readable and consistent.

- Time constants (`SECOND`, `MINUTE`, `HOUR`, `DAY`, `WEEK`, `MONTH`, `YEAR`) are in **milliseconds**, matching the `Date` API.
- `MONTH` is 30 days and `YEAR` is 365 days — fixed approximations, not calendar-aware.
- The three special symbols (`ABORT`, `NONE`, `SKIP`) are unique symbols, safe to use as sentinel values in union types.

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


## Constants

- [THOUSAND](constants/THOUSAND.md): One thousand.
- [TEN_THOUSAND](constants/TEN_THOUSAND.md): Ten thousand.
- [HUNDRED_THOUSAND](constants/HUNDRED_THOUSAND.md): Hundred thousand.
- [MILLION](constants/MILLION.md): One million.
- [BILLION](constants/BILLION.md): One billion.
- [TRILLION](constants/TRILLION.md): One trillion.
- [SECOND](constants/SECOND.md): One second in milliseconds.
- [MINUTE](constants/MINUTE.md): One minute in milliseconds.
- [HOUR](constants/HOUR.md): One hour in milliseconds.
- [DAY](constants/DAY.md): One day in milliseconds.
- [WEEK](constants/WEEK.md): One week in milliseconds.
- [MONTH](constants/MONTH.md): One month in milliseconds.
- [YEAR](constants/YEAR.md): One year in milliseconds.
- [NBSP](constants/NBSP.md): Non-breaking space (U+00A0).
- [THINSP](constants/THINSP.md): Thin space (U+2009).
- [NNBSP](constants/NNBSP.md): Non-breaking narrow space (U+202F, goes between numbers and their corresponding units).
- [ABORT](constants/ABORT.md): The ABORT symbol indicates something was manually aborted.
- [NONE](constants/NONE.md): The NONE symbol indicates something is nothing.
- [SKIP](constants/SKIP.md): The SKIP symbol indicates something should be silently skipped.
- [WAITING](constants/WAITING.md): Waiting/ellipsis icon character (⋯).
- [SUCCESS](constants/SUCCESS.md): Success/check icon character (✓).
- [FAILURE](constants/FAILURE.md): Failure/cross icon character (✗).
- [UP](constants/UP.md): Up arrow icon character (↑).
- [DOWN](constants/DOWN.md): Down arrow icon character (↓).
- [RIGHT](constants/RIGHT.md): Right arrow icon character (→).
- [LEFT](constants/LEFT.md): Left arrow icon character (←).
