# getMonthsUntil()

- Kind: function
- Import: `import { getMonthsUntil } from "shelving/util/duration";`

Count the calendar months until a date.
- e.g. from March 31st to April 1st is 1 month, even though it's only 1 day.

## Signatures

```ts
getMonthsUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMonthsUntil): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count up to. |
| `current` | `PossibleDate` | Date to count from (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getMonthsUntil` itself). Defaults to `getMonthsUntil`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of calendar months from `current` to `target` (negative if `target` is in the past). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
