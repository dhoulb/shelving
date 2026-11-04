# shelving/util/duration

- Kind: module
- Import: `import { … } from "shelving/util/duration";`

These helpers measure the distance between two dates — in milliseconds, seconds, minutes, hours, days, weeks, months, or years — and format that distance for display. They exist so callers never have to do raw date arithmetic or wrangle `Intl.DurationFormat` directly.

**Things to know:**

- `getDaysUntil()` / `getDaysAgo()` count **calendar** midnight-to-midnight days, not 24-hour periods — crossing midnight always counts as one day.
- `getMonthsUntil()` / `getYearsUntil()` are also calendar-based: March 31 → April 1 is 1 month regardless of the number of hours.
- Whole-unit helpers (`getSecondsUntil()`, `getMinutesUntil()`, `getHoursUntil()`) **round** to the nearest unit; `getWeeksUntil()` truncates.
- `"now"` is accepted anywhere a `PossibleDate` is expected and resolves to the current time.
- `formatWhen()` and `formatAgo()` collapse anything under a minute to `"just now"`.

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


## Functions

- [getMilliseconds()](duration/getMilliseconds.md): Get the millisecond difference between two dates.
- [getDuration()](duration/getDuration.md): Count the various time units between two dates and return a Duration format.
- [getUntil()](duration/getUntil.md): Get the various time units until a certain date.
- [getAgo()](duration/getAgo.md): Get the various time units since a certain date.
- [getMillisecondsUntil()](duration/getMillisecondsUntil.md): Count the milliseconds until a date.
- [getMillisecondsAgo()](duration/getMillisecondsAgo.md): Count the milliseconds since a date.
- [getSecondsUntil()](duration/getSecondsUntil.md): Count the whole seconds until a date.
- [getSecondsAgo()](duration/getSecondsAgo.md): Count the whole seconds since a date.
- [getMinutesUntil()](duration/getMinutesUntil.md): Count the whole minutes until a date.
- [getMinutesAgo()](duration/getMinutesAgo.md): Count the whole minutes since a date.
- [getHoursUntil()](duration/getHoursUntil.md): Count the whole hours until a date.
- [getHoursAgo()](duration/getHoursAgo.md): Count the whole hours since a date.
- [getDaysUntil()](duration/getDaysUntil.md): Count the calendar days until a date.
- [getDaysAgo()](duration/getDaysAgo.md): Count the calendar days since a date.
- [getWeeksUntil()](duration/getWeeksUntil.md): Count the whole weeks until a date.
- [getWeeksAgo()](duration/getWeeksAgo.md): Count the whole weeks since a date.
- [getMonthsUntil()](duration/getMonthsUntil.md): Count the calendar months until a date.
- [getMonthsAgo()](duration/getMonthsAgo.md): Count the calendar months since a date.
- [getYearsUntil()](duration/getYearsUntil.md): Count the calendar years until a date.
- [getYearsAgo()](duration/getYearsAgo.md): Count the calendar years since a date.
- [isPast()](duration/isPast.md): Is a date in the past?
- [isFuture()](duration/isFuture.md): Is a date in the future?
- [isToday()](duration/isToday.md): Is a date today (taking into account midnight).
- [getBestDurationUnit()](duration/getBestDurationUnit.md): Get a best-fit duration unit based on an amount in milliseconds.
- [formatWhen()](duration/formatWhen.md): Format a compact best-fit description of when a date happens or happened, e.g. in 10d or 2h ago or in 1w or just now
- [formatUntil()](duration/formatUntil.md): Format a compact best-fit description of how long until a date, e.g. 10d or 2h or -1w
- [formatAgo()](duration/formatAgo.md): Format a compact best-fit description of how long since a date, e.g. 10d or 2h or just now
- [formatDuration()](duration/formatDuration.md): Format a duration as a string, e.g. 1 year, 2 months, 3 days or 1y 2m 3d

## Types

- [DurationData](duration/DurationData.md): Duration data object keyed by Intl.DurationFormatUnit.
- [DurationUnitKey](duration/DurationUnitKey.md): Key for one of the duration units in DURATION_UNITS.

## Constants

- [DURATION_UNITS](duration/DURATION_UNITS.md): List of duration units (millisecond through year) keyed by unit reference.
