# CURRENCY_CODE

- Kind: constant
- Import: `import { CURRENCY_CODE } from "shelving/schema";`

Sugar instance of `CurrencyCodeSchema` for a required ISO 4217 currency code, e.g. `GBP`. Equivalent to `new CurrencyCodeSchema({})`.

## Examples

```ts
CURRENCY_CODE.validate("gbp") // "GBP"
```
