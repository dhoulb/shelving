# CurrencyCodeSchema

- Kind: class
- Import: `import { CurrencyCodeSchema } from "shelving/schema";`
- Extends: `StringSchema`

Schema that defines a valid ISO 4217 currency code, e.g. `GBP`.

- The input is sanitized to three uppercase letters, then checked against the allowed `currencies`.

## Signatures

```ts
new CurrencyCodeSchema({ one = "currency", title = "Currency", currencies = CURRENCY_CODES, max = 3, ...options }: CurrencyCodeSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `CurrencyCodeSchemaOptions` |  |
| `.value` | `string \| undefined` | Default string value used when the input is `undefined`. Read only. Optional. |
| `.max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `3`. |
| `.case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `.input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Optional. |
| `.currencies` | `ImmutableArray<CurrencyCode> \| undefined` | Set of allowed ISO 4217 currency codes. Read only. Defaults to `CURRENCY_CODES`. |

## Returns

| Type | Description |
| --- | --- |
| `CurrencyCodeSchema` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `currencies` | `ImmutableArray<CurrencyCode>` | Set of allowed ISO 4217 currency codes. Read only. |

## Examples

```ts
const schema = new CurrencyCodeSchema({});
 schema.validate("gbp"); // "GBP"
```
