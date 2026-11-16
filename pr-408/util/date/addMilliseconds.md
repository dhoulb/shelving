# addMilliseconds()

- Kind: function
- Import: `import { addMilliseconds } from "shelving/util/date";`

Return a new date that increases or decreases the milliseconds based on an input date.

## Signatures

```ts
addMilliseconds(change: number, target?: PossibleDate, caller: AnyCaller = addMilliseconds): Date
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `change` | `number` | The number of milliseconds to add (negative numbers subtract). |
| `target` | `PossibleDate` | Any value that can be converted to a date (defaults to `"now"`). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `addMilliseconds` itself). Defaults to `addMilliseconds`. |

## Returns

| Type | Description |
| --- | --- |
| `Date` | A new `Date` instance offset by `change` milliseconds. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` couldn't be converted to a valid date. |
