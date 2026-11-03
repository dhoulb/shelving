# NULLABLE_KEY

- Kind: constant
- Import: `import { NULLABLE_KEY } from "shelving/schema";`

Sugar instance allowing a `KEY` or `null`. Equivalent to `NULLABLE(KEY)`.

## Examples

```ts
NULLABLE_KEY.validate("") // null
```
