# requireDateTimeString()

- Kind: function
- Import: `import { requireDateTimeString } from "shelving/util/date";`

Convert a possible `Date` instance to a local YMD string like "2015-09-12T18:30:00", or throw `RequiredError` if it couldn't be converted.

## Signatures

```ts
requireDateTimeString(value?: PossibleDate, caller: AnyCaller = requireDateTimeString): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleDate` | Any value that we want to parse as a valid date (defaults to `"now"`). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireDateTimeString` itself). Defaults to `requireDateTimeString`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The local datetime string. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` couldn't be converted to a valid date. |
