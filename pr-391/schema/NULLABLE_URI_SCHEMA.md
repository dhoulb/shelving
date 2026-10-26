# NULLABLE_URI_SCHEMA

- Kind: constant
- Import: `import { NULLABLE_URI_SCHEMA } from "shelving/schema";`

Sugar instance allowing a `URI_SCHEMA` or `null`. Equivalent to `NULLABLE(URI_SCHEMA)`.

## Examples

```ts
NULLABLE_URI_SCHEMA.validate(null) // null
```
