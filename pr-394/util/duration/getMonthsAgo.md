# getMonthsAgo()

- Kind: function
- Import: `import { getMonthsAgo } from "shelving/util/duration";`

Count the calendar months since a date.
- e.g. from March 31st to April 1st is 1 month, even though it's only 1 day.

## Signatures

```ts
getMonthsAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMonthsAgo): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count back from. |
| `current` | `PossibleDate` | Date to count to (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getMonthsAgo` itself). Defaults to `getMonthsAgo`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of calendar months from `target` to `current` (negative if `target` is in the future). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
