# getMilliseconds()

- Kind: function
- Import: `import { getMilliseconds } from "shelving/util/duration";`

Get the millisecond difference between two dates.

## Signatures

```ts
getMilliseconds(from?: PossibleDate, to?: PossibleDate, caller: AnyCaller = getMilliseconds): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `from` | `PossibleDate` | Date the duration is measured from (defaults to now). Optional. |
| `to` | `PossibleDate` | Date the duration is measured to (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getMilliseconds` itself). Defaults to `getMilliseconds`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Number of milliseconds from `from` to `to` (negative if `to` is before `from`). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `from` or `to` cannot be converted to a valid date. |
