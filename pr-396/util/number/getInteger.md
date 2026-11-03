# getInteger()

- Kind: function
- Import: `import { getInteger } from "shelving/util/number";`

Convert an unknown value to an integer, or return `undefined` if it cannot be converted.

Conversion rules:
- Integers return integers.
- `-0` is normalised to `0`
- Strings are parsed as integers using `parseInt()` after removing non-numeric characters.
- Dates return their milliseconds (e.g. `date.getTime()`).
- Everything else returns `undefined`

## Signatures

```ts
getInteger(value: unknown): number | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to convert. |

## Returns

| Type | Description |
| --- | --- |
| `number \| undefined` | The integer, or `undefined` if `value` cannot be converted. |
