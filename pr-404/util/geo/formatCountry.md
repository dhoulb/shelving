# formatCountry()

- Kind: function
- Import: `import { formatCountry } from "shelving/util/geo";`

Format a country code into its full country name.
- Matching is case-insensitive; unknown codes are returned unchanged.

## Signatures

```ts
formatCountry(country: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `country` | `string` | The country code to format. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The full English country name, or the input unchanged if it is not a known code. |
