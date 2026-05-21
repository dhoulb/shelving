# Date and time helpers

Parse, validate, format, and manipulate dates. The central idea is `PossibleDate` — a value that *could* be a date — which the helpers accept everywhere so you rarely need to call `new Date()` yourself.

- `getDate` accepts `Date`, number (ms since epoch), date/time strings, and the convenience strings `"now"`, `"today"`, `"tomorrow"`, `"yesterday"`.
- All string output is **local time**, not UTC — `getDateString` produces `"2015-09-12"`, not an ISO UTC string.
- Invalid `Date` objects (e.g. `new Date("blah")`) are treated the same as missing values — `isDate` returns `false`, `getDate` returns `undefined`.
- `addMonths` and `addYears` clamp to the end of the month to avoid JavaScript's rollover behaviour (e.g. adding one month to 31 August gives 30 September, not 1 October).

## Usage

### Parsing

```ts
import { getDate, requireDate, isDate, assertDate } from "shelving/util";

getDate("now");          // current Date
getDate("today");        // midnight today
getDate("tomorrow");     // midnight tomorrow
getDate("2024-03-15");   // Date at that local date
getDate("18:30");        // today at 18:30
getDate(1710000000000);  // Date from Unix ms timestamp
getDate("not a date");   // undefined

requireDate("2024-03-15"); // Date or throws RequiredError
isDate(new Date("bad"));   // false
```

### Formatting

```ts
import { getDateString, getTimeString, getDateTimeString } from "shelving/util";
import { requireDateString, requireTimeString, requireDateTimeString } from "shelving/util";

getDateString("now");      // "2024-03-15"
getTimeString("now");      // "18:30:00"
getDateTimeString("now");  // "2024-03-15T18:30:00"

// Throwing variants — useful when you know the value is valid:
requireDateString("2024-01-01"); // "2024-01-01"
```

### Timestamps

```ts
import { getTimestamp, requireTimestamp } from "shelving/util";

getTimestamp("2024-01-01"); // 1704067200000 (ms since epoch)
requireTimestamp("now");    // current time in ms
```

### Anchor dates

```ts
import { getNow, getToday, getTomorrow, getYesterday, getMidnight, getMonday, getMonthStart } from "shelving/util";

getNow();              // current moment
getToday();            // midnight today
getMidnight("2024-03-15"); // midnight on that date
getMonday();           // midnight on Monday of current week
getMonthStart();       // midnight on the 1st of current month
```

### Day of week

```ts
import { getDay, DAYS } from "shelving/util";

getDay("2024-03-15"); // "Friday"
DAYS[0];              // "Sunday"
```

### Date arithmetic

```ts
import { addDays, addWeeks, addMonths, addYears, addHours, addMinutes, addSeconds, addMilliseconds } from "shelving/util";

addDays(7, "2024-03-01");    // 2024-03-08
addMonths(1, "2024-01-31");  // 2024-02-29 (leap year) or 2024-02-28
addYears(-1, "2024-02-29");  // 2023-02-28 (clamped, not a leap year)
addHours(2, "now");          // 2 hours from now
```

## See also

- [util](/util) — full util module overview
- [constants](/util/constants) — `DAY`, `WEEK`, `MONTH`, `YEAR` in milliseconds
