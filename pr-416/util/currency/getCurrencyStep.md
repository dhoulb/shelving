# getCurrencyStep()

- Kind: function
- Import: `import { getCurrencyStep } from "shelving/util/currency";`

Get the "step" value for a currency, i.e. the smallest fractional unit that is used for that currency.
- E.g. `0.01` for USD, `0.001` for some cryptocurrencies, and `1` for JPY.

## Signatures

```ts
getCurrencyStep(currency: CurrencyCode, caller: AnyCaller = getCurrencyStep): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `currency` | `CurrencyCode` | The ISO 4217 currency code to get the step for. |
| `caller` | `AnyCaller` | The function to attribute a thrown error to (defaults to `getCurrencyStep`). Defaults to `getCurrencyStep`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | The smallest fractional unit used for the currency. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If the currency code is malformed or unsupported. |
