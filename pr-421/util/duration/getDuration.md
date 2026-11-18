# getDuration()

- Kind: function
- Import: `import { getDuration } from "shelving/util/duration";`

Count the various time units between two dates and return a `Duration` format.

## Signatures

```ts
getDuration(from?: PossibleDate, to?: PossibleDate, caller: AnyCaller = getDuration): DurationData
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `from` | `PossibleDate` | Date the duration is measured from (defaults to now). Optional. |
| `to` | `PossibleDate` | Date the duration is measured to (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getDuration` itself). Defaults to `getDuration`. |

## Returns

| Type | Description |
| --- | --- |
| `DurationData` | `DurationData` object breaking the span down into years, months, weeks, days, hours, minutes, seconds, and milliseconds. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `from` or `to` cannot be converted to a valid date. |
