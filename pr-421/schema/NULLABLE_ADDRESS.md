# NULLABLE_ADDRESS

- Kind: constant
- Import: `import { NULLABLE_ADDRESS } from "shelving/schema";`

Sugar instance allowing an `ADDRESS` or `null`. Equivalent to `NULLABLE(ADDRESS)`.

## Examples

```ts
NULLABLE_ADDRESS.validate(null); // Returns null
```
