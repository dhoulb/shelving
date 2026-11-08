# NULLABLE_SLUG

- Kind: constant
- Import: `import { NULLABLE_SLUG } from "shelving/schema";`

Sugar instance allowing a `SLUG` or `null`. Equivalent to `NULLABLE(SLUG)`.

## Examples

```ts
NULLABLE_SLUG.validate(null) // null
```
