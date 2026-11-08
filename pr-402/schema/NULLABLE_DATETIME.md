# NULLABLE_DATETIME

- Kind: constant
- Import: `import { NULLABLE_DATETIME } from "shelving/schema";`

Sugar instance allowing a `DATETIME` or `null`. Equivalent to `NULLABLE(DATETIME)`.

## Examples

```ts
NULLABLE_DATETIME.validate(null) // null
```
