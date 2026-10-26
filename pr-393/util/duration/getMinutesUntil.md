# getMinutesUntil()

- Kind: function
- Import: `import { getMinutesUntil } from "shelving/util/duration";`

Count the whole minutes until a date.
- Rounds to the nearest whole minute, i.e. `1 min 29 seconds` returns `1`

## Signatures

```ts
getMinutesUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMinutesUntil): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count up to. |
| `current` | `PossibleDate` | Date to count from (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getMinutesUntil` itself). Defaults to `getMinutesUntil`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of whole minutes from `current` to `target` (negative if `target` is in the past). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
