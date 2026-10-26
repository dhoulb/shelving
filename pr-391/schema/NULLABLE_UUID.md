# NULLABLE_UUID

- Kind: constant
- Import: `import { NULLABLE_UUID } from "shelving/schema";`

Sugar instance allowing a `UUID` or `null`. Equivalent to `NULLABLE(UUID)`.

## Examples

```ts
NULLABLE_UUID.validate(null) // null
```
