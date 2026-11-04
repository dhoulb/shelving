# GBP_AMOUNT

- Kind: constant
- Import: `import { GBP_AMOUNT } from "shelving/schema";`

Sugar instance of `CurrencyAmountSchema` for a pound sterling amount. Equivalent to `new CurrencyAmountSchema({ currency: "GBP" })`.

## Examples

```ts
GBP_AMOUNT.validate("12.345") // 12.35
```
