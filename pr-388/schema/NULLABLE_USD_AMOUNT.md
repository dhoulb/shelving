# NULLABLE_USD_AMOUNT

- Kind: constant
- Import: `import { NULLABLE_USD_AMOUNT } from "shelving/schema";`

Sugar instance allowing a `USD_AMOUNT` or `null`. Equivalent to `NULLABLE(USD_AMOUNT)`.

## Examples

```ts
NULLABLE_USD_AMOUNT.validate(null) // null
```
