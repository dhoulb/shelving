# UUIDSchema

- Kind: class
- Import: `import { UUIDSchema } from "shelving/schema";`
- Extends: `StringSchema`

Schema that defines a valid UUID string (versions 1-5). Defaults to any-version validation.

- Input is trimmed and lowercased.
- Falsy values are converted to an empty string.

## Signatures

```ts
new UUIDSchema({ one = "UUID", title = "UUID", max = 36, ...rest }: UUIDSchemaOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `rest` | `UUIDSchemaOptions` | Defaults to `{}`. |
| `.value` | `string \| undefined` | Default string value used when the input is `undefined`. Read only. Optional. |
| `.max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `36`. |
| `.case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `.input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `UUIDSchema` |  |

## Examples

```ts
const schema = new UUIDSchema({});
	schema.validate("F47AC10B-58CC-4372-A567-0E02B2C3D479") // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
```
