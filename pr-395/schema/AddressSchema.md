# AddressSchema

- Kind: class
- Import: `import { AddressSchema } from "shelving/schema";`
- Extends: `DataSchema<AddressData>`

Schema that validates a postal address.

- Validates the `address1`, `address2`, `city`, `state`, `postcode`, and `country` fields as a single `AddressData` object.
- Formats validated values into a human-readable address string via `formatAddress()`.

## Signatures

```ts
new AddressSchema({ one = "address", title = "Address", ...options }: AddressSchemaOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `AddressSchemaOptions` | Defaults to `{}`. |
| `.value` | `Partial<AddressData> \| undefined` | Partial default value merged over the per-field defaults. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `AddressSchema` |  |

## Examples

```ts
ADDRESS.validate({ address1: "1 High St", city: "London", postcode: "SW1A 1AA", country: "GB" });
```
