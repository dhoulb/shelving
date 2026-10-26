# isToday()

- Kind: function
- Import: `import { isToday } from "shelving/util/duration";`

Is a date today (taking into account midnight).

## Signatures

```ts
isToday(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = isToday): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to test. |
| `current` | `PossibleDate` | Date to test against (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `isToday` itself). Defaults to `isToday`. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if `target` falls on the same calendar day as `current`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
