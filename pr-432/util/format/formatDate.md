# formatDate()

- Kind: function
- Import: `import { formatDate } from "shelving/util/format";`

Format a date in the browser locale.

## Signatures

```ts
formatDate(date: PossibleDate, options?: DateFormatOptions, caller: AnyCaller = formatDate): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `date` | `PossibleDate` | Date to format. |
| `options` | `DateFormatOptions` | Formatting options passed through to `Date.toLocaleDateString`. Optional. |
| `.locale` | `Intl.Locale \| undefined` | Override the locale for formatting (defaults to detected locale). Read only. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `formatDate` itself). Defaults to `formatDate`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Locale-formatted date string. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `date` cannot be converted to a valid date. |
