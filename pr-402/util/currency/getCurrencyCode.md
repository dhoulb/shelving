# getCurrencyCode()

- Kind: function
- Import: `import { getCurrencyCode } from "shelving/util/currency";`

Normalise a value to a valid ISO 4217 `CurrencyCode`, or `undefined` if it isn't a supported currency.
- Upper-cases and trims the input before checking it against `CURRENCY_CODES`.

## Signatures

```ts
getCurrencyCode(value: string): CurrencyCode | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `string` | The string to normalise and check. |

## Returns

| Type | Description |
| --- | --- |
| `CurrencyCode \| undefined` | The normalised `CurrencyCode`, or `undefined` if the value isn't a supported currency. |
