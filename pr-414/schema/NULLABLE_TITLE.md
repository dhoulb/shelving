# NULLABLE_TITLE

- Kind: constant
- Import: `import { NULLABLE_TITLE } from "shelving/schema";`

Sugar instance allowing a `TITLE` or `null`. Equivalent to `NULLABLE(TITLE)`.

## Examples

```ts
NULLABLE_TITLE.validate(null); // Returns null
```
