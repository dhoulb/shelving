# NULLABLE_NAME

- Kind: constant
- Import: `import { NULLABLE_NAME } from "shelving/schema";`

Sugar instance allowing a `NAME` or `null`. Equivalent to `NULLABLE(NAME)`.

## Examples

```ts
NULLABLE_NAME.validate(null); // Returns null
```
