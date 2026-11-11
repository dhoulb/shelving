# getMidnight()

- Kind: function
- Import: `import { getMidnight } from "shelving/util/date";`

Get a `Date` representing exactly midnight of the specified date.

## Signatures

```ts
getMidnight(target?: PossibleDate, caller: AnyCaller = getMidnight): Date
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | The date to find midnight for (defaults to `"now"`). Optional. |
| `caller` | `AnyCaller` | The function to attribute a thrown error to (defaults to `getMidnight`). Defaults to `getMidnight`. |

## Returns

| Type | Description |
| --- | --- |
| `Date` | A new `Date` instance at midnight of the target date. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` couldn't be converted to a valid date. |
