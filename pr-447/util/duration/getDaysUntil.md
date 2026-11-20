# getDaysUntil()

- Kind: function
- Import: `import { getDaysUntil } from "shelving/util/duration";`

Count the calendar days until a date.
- e.g. from 23:59 to 00:01 is 1 day, even though it's only 1 minutes.

## Signatures

```ts
getDaysUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getDaysUntil): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count up to. |
| `current` | `PossibleDate` | Date to count from (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getDaysUntil` itself). Defaults to `getDaysUntil`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of calendar days from `current` to `target` (negative if `target` is in the past). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
