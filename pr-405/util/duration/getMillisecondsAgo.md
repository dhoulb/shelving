# getMillisecondsAgo()

- Kind: function
- Import: `import { getMillisecondsAgo } from "shelving/util/duration";`

Count the milliseconds since a date.

## Signatures

```ts
getMillisecondsAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMillisecondsAgo): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count back from. |
| `current` | `PossibleDate` | Date to count to (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getMillisecondsAgo` itself). Defaults to `getMillisecondsAgo`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of milliseconds from `target` to `current` (negative if `target` is in the future). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
