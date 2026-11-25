# getSecondsAgo()

- Kind: function
- Import: `import { getSecondsAgo } from "shelving/util/duration";`

Count the whole seconds since a date.
- Rounds to the nearest whole second, i.e. `1 second 499 ms` returns `1`

## Signatures

```ts
getSecondsAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getSecondsAgo): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count back from. |
| `current` | `PossibleDate` | Date to count to (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getSecondsAgo` itself). Defaults to `getSecondsAgo`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of whole seconds from `target` to `current` (negative if `target` is in the future). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
