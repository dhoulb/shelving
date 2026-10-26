# requireDateString()

- Kind: function
- Import: `import { requireDateString } from "shelving/util/date";`

Convert a possible `Date` instance to a local date string like "2015-09-12", or throw `RequiredError` if it couldn't be converted.

## Signatures

```ts
requireDateString(value?: PossibleDate, caller: AnyCaller = requireDateString): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleDate` | Optional. |
| `caller` | `AnyCaller` | Defaults to `requireDateString`. |

## Returns

| Type | Description |
| --- | --- |
| `string` |  |
