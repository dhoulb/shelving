# getString()

- Kind: function
- Import: `import { getString } from "shelving/util/string";`

Convert an unknown value to a string, or return `undefined` if conversion fails.
- Coerces numbers, booleans, and `Date` values, and joins arrays with `,` commas; returns `undefined` for anything else.

## Signatures

```ts
getString(value: unknown): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to convert. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The string representation of `value`, or `undefined` if it cannot be converted. |
