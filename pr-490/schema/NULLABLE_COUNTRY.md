# NULLABLE_COUNTRY

- Kind: constant
- Import: `import { NULLABLE_COUNTRY } from "shelving/schema";`

Sugar instance allowing a `COUNTRY` or `null`. Equivalent to `NULLABLE(COUNTRY)`.

## Examples

```ts
NULLABLE_COUNTRY.validate(null) // null
```
