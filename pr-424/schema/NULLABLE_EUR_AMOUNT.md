# NULLABLE_EUR_AMOUNT

- Kind: constant
- Import: `import { NULLABLE_EUR_AMOUNT } from "shelving/schema";`

Sugar instance allowing an `EUR_AMOUNT` or `null`. Equivalent to `NULLABLE(EUR_AMOUNT)`.

## Examples

```ts
NULLABLE_EUR_AMOUNT.validate(null) // null
```
