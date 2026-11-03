# NULLABLE_CURRENCY_AMOUNT()

- Kind: function
- Import: `import { NULLABLE_CURRENCY_AMOUNT } from "shelving/schema";`

Create a `NullableSchema` for an optional monetary amount in a currency, or `null`.

Sugar factory for `NullableSchema`.

## Signatures

```ts
NULLABLE_CURRENCY_AMOUNT(currency: CurrencyCode): NullableSchema<number>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `currency` | `CurrencyCode` | ISO 4217 currency code that determines the step and symbol. |

## Returns

| Type | Description |
| --- | --- |
| `NullableSchema<number>` |  |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `string` if `currency` is not a valid ISO 4217 currency code. |

## Examples

```ts
NULLABLE_CURRENCY_AMOUNT("GBP").validate(null) // null
```
