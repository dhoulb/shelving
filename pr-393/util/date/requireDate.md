# requireDate()

- Kind: function
- Import: `import { requireDate } from "shelving/util/date";`

Convert a possible date to a `Date` instance, or throw `RequiredError` if it couldn't be converted.

## Signatures

```ts
requireDate(value: PossibleDate = "now", caller: AnyCaller = requireDate): Date
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleDate` | Any value that we want to parse as a valid date (defaults to `"now"`). Defaults to `"now"`. |
| `caller` | `AnyCaller` | The function to attribute a thrown error to (defaults to `requireDate`). Defaults to `requireDate`. |

## Returns

| Type | Description |
| --- | --- |
| `Date` | A valid `Date` instance. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` couldn't be converted to a valid date. |
