# getYearsUntil()

- Kind: function
- Import: `import { getYearsUntil } from "shelving/util/duration";`

Count the calendar years until a date.
- e.g. from December 31st to January 1st is 1 year, even though it's only 1 day.

## Signatures

```ts
getYearsUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getYearsUntil): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count up to. |
| `current` | `PossibleDate` | Date to count from (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getYearsUntil` itself). Defaults to `getYearsUntil`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of calendar years from `current` to `target` (negative if `target` is in the past). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
