# getHoursAgo()

- Kind: function
- Import: `import { getHoursAgo } from "shelving/util/duration";`

Count the whole hours since a date.
- Rounds to the nearest whole hour, i.e. `1 hour 29 minutes` returns `1`

## Signatures

```ts
getHoursAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getHoursAgo): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count back from. |
| `current` | `PossibleDate` | Date to count to (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getHoursAgo` itself). Defaults to `getHoursAgo`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of whole hours from `target` to `current` (negative if `target` is in the future). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
