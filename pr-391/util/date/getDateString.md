# getDateString()

- Kind: function
- Import: `import { getDateString } from "shelving/util/date";`

Convert an unknown value to a local date string like "2015-09-12", or `undefined` if it couldn't be converted.

## Signatures

```ts
getDateString(value?: unknown): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Any value that we want to parse as a valid date. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The local date string, or `undefined` if `value` couldn't be converted. |
