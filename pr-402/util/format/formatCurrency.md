# formatCurrency()

- Kind: function
- Import: `import { formatCurrency } from "shelving/util/format";`

Format a currency amount (based on the user's browser language settings).

## Signatures

```ts
formatCurrency(amount: number, currency: string, options?: CurrencyFormatOptions, caller: AnyCaller = formatCurrency): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `amount` | `number` | Amount of money to format. |
| `currency` | `string` | ISO 4217 currency code, e.g. `"USD"` or `"GBP"`. |
| `options` | `CurrencyFormatOptions` | Formatting options passed through to `Intl.NumberFormat`. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `formatCurrency` itself). Defaults to `formatCurrency`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Locale-formatted currency string. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `currency` is not a valid currency code. |
