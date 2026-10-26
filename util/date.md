# shelving/util/date

- Kind: module
- Import: `import { … } from "shelving/util/date";`

Parse, validate, format, and manipulate dates. The central idea is `PossibleDate` — a value that *could* be a date — which the helpers accept everywhere so you rarely need to call `new Date()` yourself.

- `getDate()` accepts `Date`, number (ms since epoch), date/time strings, and the convenience strings `"now"`, `"today"`, `"tomorrow"`, `"yesterday"`.
- All string output is **local time**, not UTC — `getDateString()` produces `"2015-09-12"`, not an ISO UTC string.
- Invalid `Date` objects (e.g. `new Date("blah")`) are treated the same as missing values — `isDate()` returns `false`, `getDate` returns `undefined`.
- `addMonths()` and `addYears()` clamp to the end of the month to avoid JavaScript's rollover behaviour (e.g. adding one month to 31 August gives 30 September, not 1 October).

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


## Functions

- [isDate()](date/isDate.md): Is a value a valid Date instance?
- [assertDate()](date/assertDate.md): Assert that a value is a valid Date instance.
- [getDate()](date/getDate.md): Convert an unknown value to a valid Date instance, or return undefined if it couldn't be converted.
- [getNow()](date/getNow.md): Get a date representing this exact moment.
- [getYesterday()](date/getYesterday.md): Get a date representing midnight of the previous day.
- [getToday()](date/getToday.md): Get a date representing midnight of the current day.
- [getTomorrow()](date/getTomorrow.md): Get a date representing midnight of the next day.
- [getMidnight()](date/getMidnight.md): Get a Date representing exactly midnight of the specified date.
- [getMonday()](date/getMonday.md): Get a Date representing midnight on Monday of the specified week.
- [getMonthStart()](date/getMonthStart.md): Get a Date representing midnight on the first day of the specified month.
- [requireDate()](date/requireDate.md): Convert a possible date to a Date instance, or throw RequiredError if it couldn't be converted.
- [getTimestamp()](date/getTimestamp.md): Convert an unknown value to a timestamp (milliseconds past Unix epoch), or undefined if it couldn't be converted.
- [requireTimestamp()](date/requireTimestamp.md): Convert a possible date to a timestamp (milliseconds past Unix epoch), or throw RequiredError if it couldn't be converted.
- [getDateTimeString()](date/getDateTimeString.md): Convert an unknown value to a local date string like "2015-09-12T18:30:00", or undefined if it couldn't be converted.
- [requireDateTimeString()](date/requireDateTimeString.md): Convert a possible Date instance to a local YMD string like "2015-09-12T18:30:00", or throw RequiredError if it couldn't be converted.
- [getDateString()](date/getDateString.md): Convert an unknown value to a local date string like "2015-09-12", or undefined if it couldn't be converted.
- [requireDateString()](date/requireDateString.md): Convert a possible Date instance to a local date string like "2015-09-12", or throw RequiredError if it couldn't be converted.
- [getTimeString()](date/getTimeString.md): Convert an unknown value to a local time string like "18:32:00", or undefined if it couldn't be converted.
- [requireTimeString()](date/requireTimeString.md): Convert a possible Date instance to local time string like "18:32:00", or throw RequiredError if it couldn't be converted.
- [getDay()](date/getDay.md): Convert a Date instance to a day-of-week string like "Monday"
- [addYears()](date/addYears.md): Return a new date that increase or decreases the month based on an input date.
- [addMonths()](date/addMonths.md): Return a new date that increase or decreases the month based on an input date.
- [addWeeks()](date/addWeeks.md): Return a new date that increase or decreases the week based on an input date.
- [addDays()](date/addDays.md): Return a new date that increase or decreases the day based on an input date.
- [addHours()](date/addHours.md): Return a new date that increase or decreases the hour based on an input date.
- [addMinutes()](date/addMinutes.md): Return a new date that increase or decreases the minute based on an input date.
- [addSeconds()](date/addSeconds.md): Return a new date that increases or decreases the seconds based on an input date.
- [addMilliseconds()](date/addMilliseconds.md): Return a new date that increases or decreases the milliseconds based on an input date.

## Types

- [PossibleDate](date/PossibleDate.md): Values that can be converted to dates.
- [Day](date/Day.md): Type listing day-of-week strings.

## Constants

- [DAYS](date/DAYS.md): List of day-of-week strings.
