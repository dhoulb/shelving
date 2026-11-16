# NULLABLE_ENTITY

- Kind: constant
- Import: `import { NULLABLE_ENTITY } from "shelving/schema";`

Sugar instance allowing an `ENTITY` or `null`. Equivalent to `NULLABLE(ENTITY)`.

## Examples

```ts
NULLABLE_ENTITY.validate("") // null
```
