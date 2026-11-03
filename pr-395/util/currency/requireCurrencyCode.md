# requireCurrencyCode()

- Kind: function
- Import: `import { requireCurrencyCode } from "shelving/util/currency";`

Normalise a value to a valid ISO 4217 `CurrencyCode`, or throw `RequiredError` if it isn't a supported currency.

## Signatures

```ts
requireCurrencyCode(value: string, caller: AnyCaller = requireCurrencyCode): CurrencyCode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `string` | The string to normalise and check. |
| `caller` | `AnyCaller` | The function to attribute a thrown error to (defaults to `requireCurrencyCode`). Defaults to `requireCurrencyCode`. |

## Returns

| Type | Description |
| --- | --- |
| `CurrencyCode` | The normalised `CurrencyCode`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If the value isn't a supported ISO 4217 currency code. |
