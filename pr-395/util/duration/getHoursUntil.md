# getHoursUntil()

- Kind: function
- Import: `import { getHoursUntil } from "shelving/util/duration";`

Count the whole hours until a date.
- Rounds to the nearest whole hour, i.e. `1 hour 29 minutes` returns `1`

## Signatures

```ts
getHoursUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getHoursUntil): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count up to. |
| `current` | `PossibleDate` | Date to count from (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getHoursUntil` itself). Defaults to `getHoursUntil`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of whole hours from `current` to `target` (negative if `target` is in the past). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
