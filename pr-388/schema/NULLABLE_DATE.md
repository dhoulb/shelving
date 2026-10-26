# NULLABLE_DATE

- Kind: constant
- Import: `import { NULLABLE_DATE } from "shelving/schema";`

Sugar instance allowing a `DATE` or `null`. Equivalent to `NULLABLE(DATE)`.

## Examples

```ts
NULLABLE_DATE.validate(null) // null
```
