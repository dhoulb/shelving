# NULLABLE_GBP_AMOUNT

- Kind: constant
- Import: `import { NULLABLE_GBP_AMOUNT } from "shelving/schema";`

Sugar instance allowing a `GBP_AMOUNT` or `null`. Equivalent to `NULLABLE(GBP_AMOUNT)`.

## Examples

```ts
NULLABLE_GBP_AMOUNT.validate(null) // null
```
