# getMonthStart()

- Kind: function
- Import: `import { getMonthStart } from "shelving/util/date";`

Get a `Date` representing midnight on the first day of the specified month.

## Signatures

```ts
getMonthStart(target?: PossibleDate, caller: AnyCaller = getMonthStart): Date
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | The date whose month to find the start of (defaults to `"now"`). Optional. |
| `caller` | `AnyCaller` | The function to attribute a thrown error to (defaults to `getMonthStart`). Defaults to `getMonthStart`. |

## Returns

| Type | Description |
| --- | --- |
| `Date` | A new `Date` instance at midnight on the 1st of the target month. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` couldn't be converted to a valid date. |
