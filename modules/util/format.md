# Formatting values

A collection of helpers for converting typed values into user-readable strings. All formatters respect the browser's locale by default and accept an optional `locale` override — they delegate to the `Intl` APIs where possible so internationalisation and translation are handled automatically.

**Things to know:**

- [`formatPercent()`](/util/format/formatPercent) takes a 0–100 numerator (not 0–1 like the raw `Intl` API), defaults to zero decimal places, and rounds toward zero so "99.99%" shows as "99%".
- [`formatUnit()`](/util/format/formatUnit) falls back gracefully when the browser does not support a given unit in `Intl.NumberFormat`.
- [`formatValue()`](/util/format/formatValue) is the catch-all: `null`/`undefined` → `"None"`, booleans → `"Yes"`/`"No"`, arrays → locale list, objects → `name`/`title`/`id` property.
- [`formatURI()`](/util/format/formatURI) strips the scheme and query string — `mailto:dave@shax.com` → `dave@shax.com`.

## Usage

### Numbers, ranges, and currencies

```ts
import { formatNumber, formatRange, formatCurrency, formatPercent } from "shelving/util";

formatNumber(1234567.89);             // "1,234,567.89"  (locale-dependent)
formatRange(10, 20);                   // "10–20"
formatCurrency(9.99, "GBP");          // "£9.99"
formatPercent(33.3);                   // "33%"
formatPercent(33.3, 100, { maximumFractionDigits: 1 }); // "33.3%"
```

### Units

```ts
import { formatUnit } from "shelving/util";

formatUnit(5, "kilometer");                   // "5 km"  (browser-supported unit)
formatUnit(12, "widget", { unitDisplay: "long", one: "widget", many: "widgets" });
// "12 widgets"
```

### Dates and times

```ts
import { formatDate, formatTime, formatDateTime } from "shelving/util";

formatDate(new Date("2024-06-01"));           // "6/1/2024"  (locale-dependent)
formatTime(new Date("2024-06-01T14:30:00"));  // "02:30 PM"
formatDateTime(new Date("2024-06-01T14:30:00")); // "6/1/2024, 02:30 PM"
```

### Booleans and generic values

```ts
import { formatBoolean, formatValue } from "shelving/util";

formatBoolean(true);   // "Yes"
formatBoolean(false);  // "No"

formatValue(null);           // "None"
formatValue(42);             // "42"
formatValue([1, 2, 3]);      // "1, 2, and 3"
formatValue({ name: "Alice" }); // "Alice"
```

### Arrays and objects

```ts
import { formatArray, formatObject } from "shelving/util";

formatArray(["apples", "oranges", "pears"]);          // "apples, oranges, and pears"
formatArray(["apples", "oranges"], { type: "disjunction" }); // "apples or oranges"
formatObject({ name: "Widget" });  // "Widget"
```

### URLs and URIs

```ts
import { formatURI, formatURL } from "shelving/util";

formatURI("mailto:dave@shax.com");              // "dave@shax.com"
formatURL("https://example.com/page?ref=123");  // "example.com/page"
```
