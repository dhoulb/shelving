# getCountry()

- Kind: function
- Import: `import { getCountry } from "shelving/util/geo";`

Parse a country string, or detect a browser country from `navigator.language`.
- When `value` is `"detect"`, reads the last two characters of `navigator.language` (if available).
- Matching is case-insensitive; the value is uppercased before lookup.

## Signatures

```ts
getCountry(value: unknown = "detect"): Country | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The country code to parse, or `"detect"` to read it from the browser. Defaults to `"detect"`. Defaults to `"detect"`. |

## Returns

| Type | Description |
| --- | --- |
| `Country \| undefined` | The matching `Country` code, or `undefined` if it could not be resolved. |
