# formatAddress()

- Kind: function
- Import: `import { formatAddress } from "shelving/util/geo";`

Format address data into a single multiline string.
- Each field is placed on its own line; an empty `address2` is omitted.
- The country code is expanded to its full name via `formatCountry()`.

## Signatures

```ts
formatAddress({ address1, address2, city, state, postcode, country }: AddressData): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `address` | `AddressData` | The address data to format. |
| `.address1` | `string` | Read only. |
| `.address2` | `string` | Read only. |
| `.city` | `string` | Read only. |
| `.state` | `string` | Read only. |
| `.postcode` | `string` | Read only. |
| `.country` | `Country` | Read only. |

## Returns

| Type | Description |
| --- | --- |
| `string` | A newline-separated address string. |
