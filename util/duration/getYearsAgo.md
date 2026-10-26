# getYearsAgo()

- Kind: function
- Import: `import { getYearsAgo } from "shelving/util/duration";`

Count the calendar years since a date.
- Note this counts calendar years, not 365-day periods.
- e.g. from December 31st to January 1st is -1 years, even though it's only 1 day.

## Signatures

```ts
getYearsAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getYearsAgo): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count back from. |
| `current` | `PossibleDate` | Date to count to (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getYearsAgo` itself). Defaults to `getYearsAgo`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of calendar years from `target` to `current` (negative if `target` is in the future). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
