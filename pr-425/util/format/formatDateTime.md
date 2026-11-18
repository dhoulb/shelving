# formatDateTime()

- Kind: function
- Import: `import { formatDateTime } from "shelving/util/format";`

Format a datetime in the browser locale (no seconds by default).

## Signatures

```ts
formatDateTime(date: PossibleDate, options?: DateFormatOptions, caller: AnyCaller = formatDateTime): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `date` | `PossibleDate` | Date to format. |
| `options` | `DateFormatOptions` | Formatting options passed through to `Date.toLocaleString`. Optional. |
| `.locale` | `Intl.Locale \| undefined` | Override the locale for formatting (defaults to detected locale). Read only. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `formatDateTime` itself). Defaults to `formatDateTime`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Locale-formatted datetime string. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `date` cannot be converted to a valid date. |
