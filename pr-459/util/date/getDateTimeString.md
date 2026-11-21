# getDateTimeString()

- Kind: function
- Import: `import { getDateTimeString } from "shelving/util/date";`

Convert an unknown value to a local date string like "2015-09-12T18:30:00", or `undefined` if it couldn't be converted.

## Signatures

```ts
getDateTimeString(value?: unknown): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Any value that we want to parse as a valid date. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The local datetime string, or `undefined` if `value` couldn't be converted. |
