# EUR_AMOUNT

- Kind: constant
- Import: `import { EUR_AMOUNT } from "shelving/schema";`

Sugar instance of `CurrencyAmountSchema` for a euro amount. Equivalent to `new CurrencyAmountSchema({ currency: "EUR" })`.

## Examples

```ts
EUR_AMOUNT.validate("12.345") // 12.35
```
