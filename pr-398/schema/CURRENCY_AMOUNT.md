# CURRENCY_AMOUNT()

- Kind: function
- Import: `import { CURRENCY_AMOUNT } from "shelving/schema";`

Create a `CurrencyAmountSchema` for a non-negative monetary amount in a currency.

Sugar factory for `CurrencyAmountSchema`.

## Signatures

```ts
CURRENCY_AMOUNT(currency: CurrencyCode): CurrencyAmountSchema
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `currency` | `CurrencyCode` | ISO 4217 currency code that determines the step and symbol. |

## Returns

| Type | Description |
| --- | --- |
| `CurrencyAmountSchema` |  |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `string` if `currency` is not a valid ISO 4217 currency code. |

## Examples

```ts
CURRENCY_AMOUNT("GBP").validate("12.345") // 12.35
```
