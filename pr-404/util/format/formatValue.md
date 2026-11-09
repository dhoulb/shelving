# formatValue()

- Kind: function
- Import: `import { formatValue } from "shelving/util/format";`

Convert any unknown value into a friendly string for user-facing use.
- Strings return the string.
- Booleans return `"Yes"` or `"No"`
- Numbers return formatted number with commas etc (e.g. `formatNumber()`).
- Dates return formatted datetime (e.g. `formatDateTime()`).
- Arrays return the array items converted to string (with `toTitle()`), and joined with a comma.
- Objects return...
  1. `object.name` if it exists, or
  2. `object.title` if it exists.
- Falsy values like `null` and `undefined` return `"None"`
- Everything else returns `"Unknown"`

## Signatures

```ts
formatValue(value: unknown, options?: FormatOptions, caller: AnyCaller = formatValue): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Unknown value to format. |
| `options` | `FormatOptions` | Formatting options passed through to the underlying formatter. Optional. |
| `.locale` | `Intl.Locale \| undefined` | Override the locale for formatting (defaults to detected locale). Read only. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `formatValue` itself). Defaults to `formatValue`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | User-facing string representation of `value`. |
