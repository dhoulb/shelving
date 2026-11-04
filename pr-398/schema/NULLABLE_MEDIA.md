# NULLABLE_MEDIA

- Kind: constant
- Import: `import { NULLABLE_MEDIA } from "shelving/schema";`

Sugar instance allowing a `MEDIA` or `null`. Equivalent to `NULLABLE(MEDIA)`.

## Examples

```ts
NULLABLE_MEDIA.validate(null); // Returns null
```
