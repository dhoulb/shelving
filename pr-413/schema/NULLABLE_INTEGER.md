# NULLABLE_INTEGER

- Kind: constant
- Import: `import { NULLABLE_INTEGER } from "shelving/schema";`

Sugar instance allowing an `INTEGER` or `null`. Equivalent to `NULLABLE(INTEGER)`.

## Examples

```ts
NULLABLE_INTEGER.validate(null); // Returns null
```
