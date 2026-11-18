# NULLABLE_VIDEO

- Kind: constant
- Import: `import { NULLABLE_VIDEO } from "shelving/schema";`

Sugar instance allowing a `VIDEO` or `null`. Equivalent to `NULLABLE(VIDEO)`.

## Examples

```ts
NULLABLE_VIDEO.validate(null); // Returns null
```
