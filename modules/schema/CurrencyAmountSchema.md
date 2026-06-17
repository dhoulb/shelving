# CurrencyAmountSchema

A [`NumberSchema`](/schema/NumberSchema) subclass for monetary amounts. It rounds to the currency's minor units (e.g. two decimal places for `GBP`) and exposes a `format()` method that renders the amount with the correct currency symbol.

[`USD_AMOUNT`](/schema/USD_AMOUNT), [`GBP_AMOUNT`](/schema/GBP_AMOUNT), and [`EUR_AMOUNT`](/schema/EUR_AMOUNT) are ready-made sugar instances; the [`CURRENCY_AMOUNT(code)`](/schema/CURRENCY_AMOUNT) sugar factory builds one for any currency code.

## Usage

```ts
import { CurrencyAmountSchema } from "shelving/schema";

const PRICE = new CurrencyAmountSchema({ title: "Price", currency: "GBP", min: 0 });
PRICE.validate("12.345");        // 12.35   (rounded to minor units)
PRICE.format(12.3);              // "£12.30"
```

## See also

- [`NumberSchema`](/schema/NumberSchema) — the base class.
- [schema](/schema) — overview of schema concepts and composition.
