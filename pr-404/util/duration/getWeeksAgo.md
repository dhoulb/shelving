# getWeeksAgo()

- Kind: function
- Import: `import { getWeeksAgo } from "shelving/util/duration";`

Count the whole weeks since a date.
- Rounds to the nearest whole week.

## Signatures

```ts
getWeeksAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getWeeksAgo): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count back from. |
| `current` | `PossibleDate` | Date to count to (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getWeeksAgo` itself). Defaults to `getWeeksAgo`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of whole weeks from `target` to `current` (negative if `target` is in the future). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
