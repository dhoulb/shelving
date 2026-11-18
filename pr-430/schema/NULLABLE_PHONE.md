# NULLABLE_PHONE

- Kind: constant
- Import: `import { NULLABLE_PHONE } from "shelving/schema";`

Sugar instance allowing a `PHONE` or `null`. Equivalent to `NULLABLE(PHONE)`.

## Examples

```ts
NULLABLE_PHONE.validate(null); // Returns null
```
