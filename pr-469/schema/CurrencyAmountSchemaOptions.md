# CurrencyAmountSchemaOptions

- Kind: interface
- Import: `import { CurrencyAmountSchemaOptions } from "shelving/schema";`
- Extends: `NumberSchemaOptions`

Options for `CurrencyAmountSchema`.

## Signatures

```ts
{
	readonly symbol?: string | undefined;
	readonly currency: CurrencyCode;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `symbol` | `string \| undefined` | Override the currency symbol used when formatting. Read only. Optional. |
| `currency` | `CurrencyCode` | ISO 4217 currency code that determines the step and symbol. Read only. |
