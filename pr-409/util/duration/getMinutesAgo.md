# getMinutesAgo()

- Kind: function
- Import: `import { getMinutesAgo } from "shelving/util/duration";`

Count the whole minutes since a date.
- Rounds to the nearest whole minute, i.e. `1 min 29 seconds` returns `1`

## Signatures

```ts
getMinutesAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMinutesAgo): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count back from. |
| `current` | `PossibleDate` | Date to count to (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getMinutesAgo` itself). Defaults to `getMinutesAgo`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of whole minutes from `target` to `current` (negative if `target` is in the future). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
