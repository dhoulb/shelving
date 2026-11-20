# NULLABLE_URL_SCHEMA

- Kind: constant
- Import: `import { NULLABLE_URL_SCHEMA } from "shelving/schema";`

Sugar instance allowing a `URL_SCHEMA` or `null`. Equivalent to `NULLABLE(URL_SCHEMA)`.

## Examples

```ts
NULLABLE_URL_SCHEMA.validate(null) // null
```
