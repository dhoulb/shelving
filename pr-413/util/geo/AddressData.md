# AddressData

- Kind: type
- Import: `import { AddressData } from "shelving/util/geo";`

Valid shape for physical address data.

## Signatures

```ts
{
	readonly address1: string;
	readonly address2: string;
	readonly city: string;
	readonly state: string;
	readonly postcode: string;
	readonly country: Country;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `address1` | `string` | Read only. |
| `address2` | `string` | Read only. |
| `city` | `string` | Read only. |
| `state` | `string` | Read only. |
| `postcode` | `string` | Read only. |
| `country` | `Country` | Read only. |

## Types

- [Country](Country.md): Two-letter ISO 3166-1 alpha-2 country code string (a key of COUNTRIES).
