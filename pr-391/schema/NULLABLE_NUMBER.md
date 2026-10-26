# NULLABLE_NUMBER

- Kind: constant
- Import: `import { NULLABLE_NUMBER } from "shelving/schema";`

Sugar instance allowing a `NUMBER` or `null`. Equivalent to `NULLABLE(NUMBER)`.

## Examples

```ts
NULLABLE_NUMBER.validate(null); // Returns null
```
