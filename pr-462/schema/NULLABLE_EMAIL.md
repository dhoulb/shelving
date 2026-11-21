# NULLABLE_EMAIL

- Kind: constant
- Import: `import { NULLABLE_EMAIL } from "shelving/schema";`

Sugar instance allowing an `EMAIL` or `null`. Equivalent to `NULLABLE(EMAIL)`.

## Examples

```ts
NULLABLE_EMAIL.validate(null); // Returns null
```
