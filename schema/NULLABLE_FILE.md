# NULLABLE_FILE

- Kind: constant
- Import: `import { NULLABLE_FILE } from "shelving/schema";`

Sugar instance allowing a `FILE` or `null`. Equivalent to `NULLABLE(FILE)`.

## Examples

```ts
NULLABLE_FILE.validate(null); // Returns null
```
