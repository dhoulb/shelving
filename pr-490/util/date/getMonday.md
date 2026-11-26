# getMonday()

- Kind: function
- Import: `import { getMonday } from "shelving/util/date";`

Get a `Date` representing midnight on Monday of the specified week.

## Signatures

```ts
getMonday(target?: PossibleDate, caller: AnyCaller = getMonday): Date
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | The date whose week to find Monday for (defaults to `"now"`). Optional. |
| `caller` | `AnyCaller` | The function to attribute a thrown error to (defaults to `getMonday`). Defaults to `getMonday`. |

## Returns

| Type | Description |
| --- | --- |
| `Date` | A new `Date` instance at midnight on Monday of the target week. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` couldn't be converted to a valid date. |
