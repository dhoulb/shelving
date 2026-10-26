# COUNTRY

- Kind: constant
- Import: `import { COUNTRY } from "shelving/schema";`

Sugar instance of `CountrySchema` for a required ISO 3166 country code, e.g. `GB`. Equivalent to `new CountrySchema({})`.

## Examples

```ts
COUNTRY.validate("GB") // "GB"
```
