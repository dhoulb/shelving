# getDaysAgo()

- Kind: function
- Import: `import { getDaysAgo } from "shelving/util/duration";`

Count the calendar days since a date.
- Rounds to the nearest whole days.

## Signatures

```ts
getDaysAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getDaysAgo): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count back from. |
| `current` | `PossibleDate` | Date to count to (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getDaysAgo` itself). Defaults to `getDaysAgo`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of calendar days from `target` to `current` (negative if `target` is in the future). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
