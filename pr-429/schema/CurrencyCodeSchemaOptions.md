# CurrencyCodeSchemaOptions

- Kind: interface
- Import: `import { CurrencyCodeSchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Options for `CurrencyCodeSchema`.

- The length, format, and single-line constraints are fixed internally, so only the presentation-level string options plus `currencies` are exposed.

## Signatures

```ts
{
	readonly value?: string | undefined;
	readonly max?: number | undefined;
	readonly case?: "upper" | "lower" | undefined;
	readonly input?: StringInputType | undefined;
	readonly currencies?: ImmutableArray<CurrencyCode> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `string \| undefined` | Default string value used when the input is `undefined`. Read only. Optional. |
| `max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `3`. |
| `case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Optional. |
| `currencies` | `ImmutableArray<CurrencyCode> \| undefined` | Set of allowed ISO 4217 currency codes. Read only. Defaults to `CURRENCY_CODES`. |
