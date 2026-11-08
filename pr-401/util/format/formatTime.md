# formatTime()

- Kind: function
- Import: `import { formatTime } from "shelving/util/format";`

Format a time in the browser locale (no seconds by default).

## Signatures

```ts
formatTime(time?: PossibleDate, options?: DateFormatOptions, caller: AnyCaller = formatTime): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `time` | `PossibleDate` | Time to format (defaults to now). Optional. |
| `options` | `DateFormatOptions` | Formatting options passed through to `Date.toLocaleTimeString`. Optional. |
| `.locale` | `Intl.Locale \| undefined` | Override the locale for formatting (defaults to detected locale). Read only. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `formatTime` itself). Defaults to `formatTime`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Locale-formatted time string. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `time` cannot be converted to a valid date. |
