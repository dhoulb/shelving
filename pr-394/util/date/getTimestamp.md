# getTimestamp()

- Kind: function
- Import: `import { getTimestamp } from "shelving/util/date";`

Convert an unknown value to a timestamp (milliseconds past Unix epoch), or `undefined` if it couldn't be converted.

## Signatures

```ts
getTimestamp(value?: unknown): number | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Any value that we want to parse as a valid date. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `number \| undefined` | The timestamp in milliseconds, or `undefined` if the value couldn't be converted. |
