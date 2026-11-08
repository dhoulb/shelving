# requireTimeString()

- Kind: function
- Import: `import { requireTimeString } from "shelving/util/date";`

Convert a possible `Date` instance to local time string like "18:32:00", or throw `RequiredError` if it couldn't be converted.

## Signatures

```ts
requireTimeString(value?: PossibleDate, caller: AnyCaller = requireTimeString): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleDate` | Optional. |
| `caller` | `AnyCaller` | Defaults to `requireTimeString`. |

## Returns

| Type | Description |
| --- | --- |
| `string` |  |
