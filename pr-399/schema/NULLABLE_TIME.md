# NULLABLE_TIME

- Kind: constant
- Import: `import { NULLABLE_TIME } from "shelving/schema";`

Sugar instance allowing a `TIME` or `null`. Equivalent to `NULLABLE(TIME)`.

## Examples

```ts
NULLABLE_TIME.validate(null) // null
```
