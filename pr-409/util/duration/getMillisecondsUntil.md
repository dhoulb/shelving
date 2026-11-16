# getMillisecondsUntil()

- Kind: function
- Import: `import { getMillisecondsUntil } from "shelving/util/duration";`

Count the milliseconds until a date.

## Signatures

```ts
getMillisecondsUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMillisecondsUntil): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count up to. |
| `current` | `PossibleDate` | Date to count from (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getMillisecondsUntil` itself). Defaults to `getMillisecondsUntil`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of milliseconds from `current` to `target` (negative if `target` is in the past). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
