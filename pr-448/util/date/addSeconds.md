# addSeconds()

- Kind: function
- Import: `import { addSeconds } from "shelving/util/date";`

Return a new date that increases or decreases the seconds based on an input date.

## Signatures

```ts
addSeconds(change: number, target?: PossibleDate, caller: AnyCaller = addSeconds): Date
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `change` | `number` | The number of seconds to add (negative numbers subtract). |
| `target` | `PossibleDate` | Any value that can be converted to a date (defaults to `"now"`). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `addSeconds` itself). Defaults to `addSeconds`. |

## Returns

| Type | Description |
| --- | --- |
| `Date` | A new `Date` instance offset by `change` seconds. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` couldn't be converted to a valid date. |
