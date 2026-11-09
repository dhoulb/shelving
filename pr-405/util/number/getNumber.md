# getNumber()

- Kind: function
- Import: `import { getNumber } from "shelving/util/number";`

Convert an unknown value to a finite number, or return `undefined` if it cannot be converted.
- Note: numbers can be non-finite numbers like `NaN` or `Infinity`. These are detected and will always return `undefined`

Conversion rules:
- Finite numbers return numbers.
- `-0` is normalised to `0`
- Strings are parsed as numbers using `Number.parseFloat()` after removing all non-numeric characters.
- Dates return their milliseconds (e.g. `date.getTime()`).
- Everything else returns `undefined`

## Signatures

```ts
getNumber(value: unknown): number | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to convert. |

## Returns

| Type | Description |
| --- | --- |
| `number \| undefined` | The finite number, or `undefined` if `value` cannot be converted. |
