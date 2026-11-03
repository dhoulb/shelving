# CurrencyAmountSchema

- Kind: class
- Import: `import { CurrencyAmountSchema } from "shelving/schema";`
- Extends: `NumberSchema`

Schema representing a numeric amount in a specific currency.

- The validation step is inferred from the currency's minor units.
- The default formatter renders amounts using shelving's currency helpers.

A `NumberSchema` subclass for monetary amounts. It rounds to the currency's minor units (e.g. two decimal places for `GBP`) and exposes a `format()` method that renders the amount with the correct currency symbol.

`USD_AMOUNT`, `GBP_AMOUNT`, and `EUR_AMOUNT` are ready-made sugar instances; the `CURRENCY_AMOUNT(code)` sugar factory builds one for any currency code.

## Usage

```ts
import { CurrencyAmountSchema } from "shelving/schema";

const PRICE = new CurrencyAmountSchema({ title: "Price", currency: "GBP", min: 0 });
PRICE.validate("12.345");        // 12.35   (rounded to minor units)
PRICE.format(12.3);              // "£12.30"
```


## Signatures

```ts
new CurrencyAmountSchema({ currency, one = "amount", title = "Amount", symbol, step, ...options }: CurrencyAmountSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `CurrencyAmountSchemaOptions` |  |
| `.symbol` | `string \| undefined` | Override the currency symbol used when formatting. Read only. Optional. |
| `.currency` | `CurrencyCode` | ISO 4217 currency code that determines the step and symbol. Read only. |

## Returns

| Type | Description |
| --- | --- |
| `CurrencyAmountSchema` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `currency` | `CurrencyCode` | ISO 4217 currency code this schema validates amounts for. Read only. |
| `symbol` | `string` | Currency symbol used when formatting amounts. Read only. |
