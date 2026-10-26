# NULLABLE_COLOR

- Kind: constant
- Import: `import { NULLABLE_COLOR } from "shelving/schema";`

Sugar instance allowing a `COLOR` or `null`. Equivalent to `NULLABLE(COLOR)`.

## Examples

```ts
NULLABLE_COLOR.validate(null); // Returns null
```
