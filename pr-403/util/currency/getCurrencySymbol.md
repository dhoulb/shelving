# getCurrencySymbol()

- Kind: function
- Import: `import { getCurrencySymbol } from "shelving/util/currency";`

Get the display symbol used for a currency.

## Signatures

```ts
getCurrencySymbol(currency: CurrencyCode, caller: AnyCaller = getCurrencySymbol): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `currency` | `CurrencyCode` | The ISO 4217 currency code to get the symbol for. |
| `caller` | `AnyCaller` | The function to attribute a thrown error to (defaults to `getCurrencySymbol`). Defaults to `getCurrencySymbol`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The narrow display symbol for the currency, e.g. `"£"` for `"GBP"`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If the currency code is malformed or unsupported. |
