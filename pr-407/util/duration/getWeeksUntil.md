# getWeeksUntil()

- Kind: function
- Import: `import { getWeeksUntil } from "shelving/util/duration";`

Count the whole weeks until a date.
- Rounds down to the nearest whole week, i.e.

## Signatures

```ts
getWeeksUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getWeeksUntil): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count up to. |
| `current` | `PossibleDate` | Date to count from (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getWeeksUntil` itself). Defaults to `getWeeksUntil`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of whole weeks from `current` to `target` (negative if `target` is in the past). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
