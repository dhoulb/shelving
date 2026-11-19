# CountrySchema

- Kind: class
- Import: `import { CountrySchema } from "shelving/schema";`
- Extends: `ChoiceSchema<Country, PossibleCountry>`

Schema that defines a valid ISO 3166 country code, e.g. `GB`.

- The input is coerced with `getCountry()`, then checked against the known set of `COUNTRIES`.
- A `value` of `"detect"` resolves the default country from the browser language.

## Signatures

```ts
new CountrySchema({ one = "country", title = "Country", value = "detect", ...options }: CountrySchemaOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `CountrySchemaOptions` | Defaults to `{}`. |
| `.value` | `PossibleCountry` | Country value, or `"detect"` to resolve from browser language. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `CountrySchema` |  |

## Examples

```ts
const schema = new CountrySchema({});
 schema.validate("GB"); // "GB"
```
