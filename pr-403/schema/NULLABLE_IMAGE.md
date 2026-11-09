# NULLABLE_IMAGE

- Kind: constant
- Import: `import { NULLABLE_IMAGE } from "shelving/schema";`

Sugar instance allowing an `IMAGE` or `null`. Equivalent to `NULLABLE(IMAGE)`.

## Examples

```ts
NULLABLE_IMAGE.validate(null); // Returns null
```
