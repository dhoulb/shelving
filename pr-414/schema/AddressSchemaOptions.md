# AddressSchemaOptions

- Kind: interface
- Import: `import { AddressSchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Allowed options for `AddressSchema`.

- The `props` are fixed to the postal-address fields internally, so only the default `value` and base schema options are exposed.

## Signatures

```ts
{
	readonly value?: Partial<AddressData> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `Partial<AddressData> \| undefined` | Partial default value merged over the per-field defaults. Read only. Optional. |
