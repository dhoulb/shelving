# requireTimestamp()

- Kind: function
- Import: `import { requireTimestamp } from "shelving/util/date";`

Convert a possible date to a timestamp (milliseconds past Unix epoch), or throw `RequiredError` if it couldn't be converted.

## Signatures

```ts
requireTimestamp(value?: PossibleDate): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleDate` | Any value that we want to parse as a valid date (defaults to `"now"`). Optional. |

## Returns

| Type | Description |
| --- | --- |
| `number` | The timestamp in milliseconds. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` couldn't be converted to a valid date. |
