# CountrySchemaOptions

- Kind: interface
- Import: `import { CountrySchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Options for `CountrySchema`.

## Signatures

```ts
{
	readonly value?: PossibleCountry;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `PossibleCountry` | Country value, or `"detect"` to resolve from browser language. Read only. Optional. |
