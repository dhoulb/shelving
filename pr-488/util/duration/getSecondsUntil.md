# getSecondsUntil()

- Kind: function
- Import: `import { getSecondsUntil } from "shelving/util/duration";`

Count the whole seconds until a date.
- Rounds to the nearest whole second, i.e. `1 second 499 ms` returns `1`

## Signatures

```ts
getSecondsUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getSecondsUntil): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count up to. |
| `current` | `PossibleDate` | Date to count from (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getSecondsUntil` itself). Defaults to `getSecondsUntil`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of whole seconds from `current` to `target` (negative if `target` is in the past). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
