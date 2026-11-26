# USD_AMOUNT

- Kind: constant
- Import: `import { USD_AMOUNT } from "shelving/schema";`

Sugar instance of `CurrencyAmountSchema` for a US dollar amount. Equivalent to `new CurrencyAmountSchema({ currency: "USD" })`.

## Examples

```ts
USD_AMOUNT.validate("12.345") // 12.35
```
