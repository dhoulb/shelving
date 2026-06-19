# Duration and time-difference helpers

These helpers measure the distance between two dates — in milliseconds, seconds, minutes, hours, days, weeks, months, or years — and format that distance for display. They exist so callers never have to do raw date arithmetic or wrangle `Intl.DurationFormat` directly.

**Things to know:**

- `getDaysUntil()` / `getDaysAgo()` count **calendar** midnight-to-midnight days, not 24-hour periods — crossing midnight always counts as one day.
- `getMonthsUntil()` / `getYearsUntil()` are also calendar-based: March 31 → April 1 is 1 month regardless of the number of hours.
- Whole-unit helpers (`getSecondsUntil()`, `getMinutesUntil()`, `getHoursUntil()`) **round** to the nearest unit; `getWeeksUntil()` truncates.
- `"now"` is accepted anywhere a `PossibleDate` is expected and resolves to the current time.
- `formatWhen()` collapses anything under 30 seconds to `"just now"`.

## Usage

### Counting units between dates

```ts
import { getDuration, getDaysUntil, getMonthsAgo, getMilliseconds } from "shelving/util";

const launch = new Date("2025-06-01");
const now = "now";

getDuration(now, launch);
// { years: 0, months: 0, weeks: 1, days: 3, hours: 5, minutes: 0, seconds: 0, milliseconds: 0 }

getDaysUntil(launch);          // e.g. 10  (calendar days from today)
getMonthsAgo(new Date("2024-01-15")); // e.g. 16
getMilliseconds(now, launch);  // raw ms difference
```

### Checking relative position

```ts
import { isPast, isFuture, isToday } from "shelving/util";

isPast(new Date("2020-01-01"));   // true
isFuture(new Date("2099-12-31")); // true
isToday(new Date());              // true
```

### Formatting for display

```ts
import { formatWhen, formatUntil, formatAgo, formatDuration } from "shelving/util";

formatWhen(new Date(Date.now() + 5 * 60_000));  // "in 5min"
formatWhen(new Date(Date.now() - 10_000));      // "just now"
formatAgo(new Date("2024-01-01"));              // e.g. "16mo"
formatUntil(new Date("2026-01-01"));            // e.g. "7mo"

formatDuration({ years: 1, months: 2, days: 3 }); // "1 year, 2 months, 3 days"
formatDuration({ hours: 2, minutes: 30 }, { style: "narrow" }); // "2hr 30min"
```

### Best-fit unit selection

```ts
import { getBestDurationUnit, DURATION_UNITS } from "shelving/util";

const unit = getBestDurationUnit(3 * 24 * 60 * 60 * 1000); // → "day" Unit
unit.format(unit.from(3 * 24 * 60 * 60 * 1000));           // "3d"
```
