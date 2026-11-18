# getDate()

- Kind: function
- Import: `import { getDate } from "shelving/util/date";`

Convert an unknown value to a valid `Date` instance, or return `undefined` if it couldn't be converted.
- Note: `Date` instances can be invalid (e.g. `new Date("blah blah").getTime()` returns `NaN`). These are detected and will always return `null`

## Signatures

```ts
getDate(value: unknown): Date | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Any value that we want to parse as a valid date (defaults to `undefined`). - `Date` instance returns unchanged (BUT if the date isn't valid, `undefined` is returned). - `null` or `undefined` or `""` empty string returns `undefined` - The string `"now"` returns the current date (e.g. `new Date()`). - The string `"today"` returns the current date at midnight (e.g. `getMidnight()`). - The string `"tomorrow"` returns tomorrow's date at midnight (e.g. `addDays(getMidnight(), 1)`). - The string `"yesterday"` returns yesterday's date at midnight (e.g. `addDays(getMidnight(), 1)`). - Date strings (e.g. `"2003-09-12"` or `"2003 feb 20:09"`) return the corresponding date (using the user's current locale). - Time strings (e.g. `"18:32"` or `"23:59:59.999"`) return today's date at that time (using the user's current locale). - Numbers are return the corresponding date (using `new Date(number)`, i.e. milliseconds since 01/01/1970). - Anything else returns `undefined` |

## Returns

| Type | Description |
| --- | --- |
| `Date \| undefined` | `Date` instance if the value could be converted to a valid date, or `undefined` if not. |
